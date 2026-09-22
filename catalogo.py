from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload
from app.api.deps import get_current_admin
from app.core.database import get_db
from app.core.mongo import get_mongo_db
from app.models.cidade import Cidade
from app.models.comodidade import Comodidade
from app.models.hotel import Hotel
from app.models.hotel_comodidade import HotelComodidade
from app.models.quarto import Quarto
from app.models.usuario import Usuario
from app.repositories.mongo.catalogo_repository import CatalogoRepository
from app.services.catalogo_sync_service import CatalogoSyncService
from app.schemas.catalogo import *

router=APIRouter(tags=["Catálogo"])

def _hotel_response(h: Hotel):
    return HotelResponseSchema(id=h.id,nome=h.nome,cidade_id=h.cidade_id,cidade=h.cidade.nome,
        categoria_estrelas=h.categoria_estrelas,localizacao=h.localizacao,
        comodidades=[x.comodidade_id for x in h.comodidades])

async def _sync(db: Session, hotel_id: UUID):
    service=CatalogoSyncService(db,CatalogoRepository(get_mongo_db()))
    try: await service.sincronizar_hotel(hotel_id)
    except ValueError as exc: raise HTTPException(422,str(exc))

@router.get("/cidades", response_model=list[CidadeResponseSchema])
def listar_cidades(db: Session=Depends(get_db)):
    return db.scalars(select(Cidade).order_by(Cidade.nome)).all()

@router.post("/admin/cidades", response_model=CidadeResponseSchema, status_code=201)
def criar_cidade(payload:CidadeCreateSchema, db:Session=Depends(get_db), _:Usuario=Depends(get_current_admin)):
    c=Cidade(nome=payload.nome.strip(),estado=payload.estado.strip().upper(),limite_territorial=payload.limite_territorial); db.add(c)
    try: db.commit(); db.refresh(c)
    except IntegrityError: db.rollback(); raise HTTPException(409,"Cidade já cadastrada")
    return c

@router.put("/admin/cidades/{cidade_id}", response_model=CidadeResponseSchema)
def atualizar_cidade(cidade_id:UUID,payload:CidadeCreateSchema,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    c=db.get(Cidade,cidade_id)
    if not c: raise HTTPException(404,"Cidade não encontrada")
    c.nome=payload.nome.strip(); c.estado=payload.estado.upper(); c.limite_territorial=payload.limite_territorial
    try: db.commit(); db.refresh(c)
    except IntegrityError: db.rollback(); raise HTTPException(409,"Nome de cidade já cadastrado")
    return c

@router.delete("/admin/cidades/{cidade_id}",status_code=204)
def excluir_cidade(cidade_id:UUID,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    c=db.get(Cidade,cidade_id)
    if not c: raise HTTPException(404,"Cidade não encontrada")
    db.delete(c); db.commit()

@router.get("/comodidades", response_model=list[ComodidadeResponseSchema])
def listar_comodidades(db:Session=Depends(get_db)):
    return db.scalars(select(Comodidade).order_by(Comodidade.nome)).all()

@router.post("/admin/comodidades",response_model=ComodidadeResponseSchema,status_code=201)
def criar_comodidade(payload:ComodidadeCreateSchema,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    c=Comodidade(nome=payload.nome.strip()); db.add(c)
    try: db.commit(); db.refresh(c)
    except IntegrityError: db.rollback(); raise HTTPException(409,"Comodidade já cadastrada")
    return c

@router.put("/admin/comodidades/{comodidade_id}",response_model=ComodidadeResponseSchema)
async def atualizar_comodidade(comodidade_id:UUID,payload:ComodidadeCreateSchema,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    c=db.get(Comodidade,comodidade_id)
    if not c: raise HTTPException(404,"Comodidade não encontrada")
    c.nome=payload.nome.strip()
    try: db.commit(); db.refresh(c)
    except IntegrityError: db.rollback(); raise HTTPException(409,"Comodidade já cadastrada")
    # Reconstroi todos os hotéis afetados.
    for hc in db.scalars(select(HotelComodidade).where(HotelComodidade.comodidade_id==comodidade_id)).all():
        await _sync(db,hc.hotel_id)
    return c

@router.delete("/admin/comodidades/{comodidade_id}",status_code=204)
async def excluir_comodidade(comodidade_id:UUID,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    c=db.get(Comodidade,comodidade_id)
    if not c: raise HTTPException(404,"Comodidade não encontrada")
    ids=[x.hotel_id for x in db.scalars(select(HotelComodidade).where(HotelComodidade.comodidade_id==comodidade_id)).all()]
    db.delete(c); db.commit()
    for hid in ids: await _sync(db,hid)

@router.get("/hoteis")
async def listar_hoteis(cidade_id:UUID|None=None,estrelas_min:int|None=None,busca:str|None=None,db:Session=Depends(get_db)):
    repo=CatalogoRepository(get_mongo_db())
    docs=await repo.list_hoteis()
    def ok(d):
        if cidade_id and d.get("cidade",{}).get("cidade_id")!=str(cidade_id): return False
        if estrelas_min and d.get("categoria_estrelas",0)<estrelas_min: return False
        if busca and busca.lower() not in d.get("nome","").lower(): return False
        return True
    result=[d for d in docs if ok(d)]
    # Se Mongo estiver vazio, reconstrói a projeção para o catálogo existente.
    if not result and not docs:
        for h in db.scalars(select(Hotel)).all():
            try: await _sync(db,h.id)
            except HTTPException: pass
        docs=await repo.list_hoteis(); result=[d for d in docs if ok(d)]
    return result

@router.get("/hoteis/{hotel_id}")
async def obter_hotel(hotel_id:UUID,db:Session=Depends(get_db)):
    doc=await CatalogoRepository(get_mongo_db()).get_hotel(str(hotel_id))
    if doc: return doc
    h=db.scalar(select(Hotel).options(joinedload(Hotel.cidade),joinedload(Hotel.quartos),joinedload(Hotel.comodidades)).where(Hotel.id==hotel_id))
    if not h: raise HTTPException(404,"Hotel não encontrado")
    await _sync(db,h.id); return await CatalogoRepository(get_mongo_db()).get_hotel(str(h.id))

@router.post("/admin/hoteis",response_model=HotelResponseSchema,status_code=201)
async def criar_hotel(payload:HotelCreateSchema,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    cidade=db.get(Cidade,payload.cidade_id)
    if not cidade: raise HTTPException(404,"Cidade não encontrada")
    h=Hotel(nome=payload.nome.strip(),cidade_id=payload.cidade_id,categoria_estrelas=payload.categoria_estrelas,localizacao=payload.localizacao); db.add(h)
    try: db.commit(); db.refresh(h)
    except IntegrityError: db.rollback(); raise HTTPException(409,"Não foi possível cadastrar o hotel")
    if h.localizacao: await _sync(db,h.id)
    return _hotel_response(h)

@router.put("/admin/hoteis/{hotel_id}",response_model=HotelResponseSchema)
async def atualizar_hotel(hotel_id:UUID,payload:HotelCreateSchema,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    h=db.get(Hotel,hotel_id)
    if not h: raise HTTPException(404,"Hotel não encontrado")
    if not db.get(Cidade,payload.cidade_id): raise HTTPException(404,"Cidade não encontrada")
    h.nome=payload.nome.strip(); h.cidade_id=payload.cidade_id; h.categoria_estrelas=payload.categoria_estrelas; h.localizacao=payload.localizacao
    db.commit(); db.refresh(h)
    if h.localizacao: await _sync(db,h.id)
    return _hotel_response(h)

@router.delete("/admin/hoteis/{hotel_id}",status_code=204)
async def excluir_hotel(hotel_id:UUID,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    h=db.get(Hotel,hotel_id)
    if not h: raise HTTPException(404,"Hotel não encontrado")
    await CatalogoRepository(get_mongo_db()).delete_hotel(str(h.id)); db.delete(h); db.commit()

@router.post("/admin/hoteis/{hotel_id}/comodidades/{comodidade_id}",status_code=204)
async def adicionar_comodidade(hotel_id:UUID,comodidade_id:UUID,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    if not db.get(Hotel,hotel_id) or not db.get(Comodidade,comodidade_id): raise HTTPException(404,"Hotel ou comodidade não encontrado")
    if not db.get(HotelComodidade,(hotel_id,comodidade_id)):
        db.add(HotelComodidade(hotel_id=hotel_id,comodidade_id=comodidade_id)); db.commit()
    await _sync(db,hotel_id)

@router.delete("/admin/hoteis/{hotel_id}/comodidades/{comodidade_id}",status_code=204)
async def remover_comodidade(hotel_id:UUID,comodidade_id:UUID,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    hc=db.get(HotelComodidade,(hotel_id,comodidade_id))
    if not hc: raise HTTPException(404,"Associação não encontrada")
    db.delete(hc); db.commit(); await _sync(db,hotel_id)

@router.get("/hoteis/{hotel_id}/quartos",response_model=list[QuartoResponseSchema])
def quartos_hotel(hotel_id:UUID,db:Session=Depends(get_db)):
    if not db.get(Hotel,hotel_id): raise HTTPException(404,"Hotel não encontrado")
    return db.scalars(select(Quarto).where(Quarto.hotel_id==hotel_id).order_by(Quarto.numero)).all()

@router.get("/quartos",response_model=list[QuartoResponseSchema])
def listar_quartos(db:Session=Depends(get_db)):
    return db.scalars(select(Quarto).order_by(Quarto.hotel_id,Quarto.numero)).all()

@router.post("/admin/quartos",response_model=QuartoResponseSchema,status_code=201)
async def criar_quarto(payload:QuartoCreateSchema,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    if not db.get(Hotel,payload.hotel_id): raise HTTPException(404,"Hotel não encontrado")
    q=Quarto(hotel_id=payload.hotel_id,numero=payload.numero.strip(),tipo=payload.tipo.strip(),preco_diaria=payload.preco_diaria,max_adultos=payload.max_adultos,max_criancas=payload.max_criancas); db.add(q)
    try: db.commit(); db.refresh(q)
    except IntegrityError: db.rollback(); raise HTTPException(409,"Número de quarto já cadastrado para este hotel")
    await _sync(db,q.hotel_id); return q

@router.put("/admin/quartos/{quarto_id}",response_model=QuartoResponseSchema)
async def atualizar_quarto(quarto_id:UUID,payload:QuartoCreateSchema,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    q=db.get(Quarto,quarto_id)
    if not q: raise HTTPException(404,"Quarto não encontrado")
    if q.hotel_id != payload.hotel_id: raise HTTPException(422,"Não é permitido mover o quarto entre hotéis")
    q.numero=payload.numero.strip(); q.tipo=payload.tipo.strip(); q.preco_diaria=payload.preco_diaria; q.max_adultos=payload.max_adultos; q.max_criancas=payload.max_criancas
    try: db.commit(); db.refresh(q)
    except IntegrityError: db.rollback(); raise HTTPException(409,"Número de quarto já cadastrado")
    await _sync(db,q.hotel_id); return q

@router.delete("/admin/quartos/{quarto_id}",status_code=204)
async def excluir_quarto(quarto_id:UUID,db:Session=Depends(get_db),_:Usuario=Depends(get_current_admin)):
    q=db.get(Quarto,quarto_id)
    if not q: raise HTTPException(404,"Quarto não encontrado")
    hid=q.hotel_id; db.delete(q); db.commit(); await _sync(db,hid)

@router.get("/hoteis/{hotel_id}/avaliacoes")
def listar_avaliacoes(hotel_id: UUID, db: Session = Depends(get_db)):
    from app.models.avaliacao import Avaliacao
    if not db.get(Hotel, hotel_id):
        raise HTTPException(404, "Hotel não encontrado")
    return db.scalars(select(Avaliacao).where(Avaliacao.hotel_id == hotel_id).order_by(Avaliacao.data_publicacao.desc())).all()
