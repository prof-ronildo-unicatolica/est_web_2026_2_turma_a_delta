from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.cidade import Cidade
from app.models.comodidade import Comodidade
from app.models.hotel import Hotel
from app.models.hotel_comodidade import HotelComodidade
from app.models.quarto import Quarto
from app.models.usuario import Usuario
from app.schemas.catalogo import (
    CidadeCreateSchema,
    CidadeResponseSchema,
    ComodidadeCreateSchema,
    ComodidadeResponseSchema,
    HotelCreateSchema,
    HotelResponseSchema,
    QuartoCreateSchema,
    QuartoResponseSchema,
)

router = APIRouter(tags=["Catálogo"])


@router.get("/cidades", response_model=list[CidadeResponseSchema])
def listar_cidades(db: Session = Depends(get_db)):
    return db.scalars(select(Cidade).order_by(Cidade.nome)).all()


@router.post(
    "/admin/cidades",
    response_model=CidadeResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def criar_cidade(
    payload: CidadeCreateSchema,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_admin),
):
    cidade = Cidade(
        nome=payload.nome.strip(),
        estado=payload.estado.strip().upper(),
        limite_territorial=payload.limite_territorial,
    )
    db.add(cidade)

    try:
        db.commit()
        db.refresh(cidade)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cidade já cadastrada",
        )

    return cidade


@router.get("/comodidades", response_model=list[ComodidadeResponseSchema])
def listar_comodidades(db: Session = Depends(get_db)):
    return db.scalars(select(Comodidade).order_by(Comodidade.nome)).all()


@router.post(
    "/admin/comodidades",
    response_model=ComodidadeResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def criar_comodidade(
    payload: ComodidadeCreateSchema,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_admin),
):
    comodidade = Comodidade(nome=payload.nome.strip())
    db.add(comodidade)

    try:
        db.commit()
        db.refresh(comodidade)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Comodidade já cadastrada",
        )

    return comodidade


@router.get("/hoteis", response_model=list[HotelResponseSchema])
def listar_hoteis(
    cidade_id: UUID | None = None,
    estrelas_min: int | None = None,
    busca: str | None = None,
    db: Session = Depends(get_db),
):
    query = (
        select(Hotel)
        .options(
            joinedload(Hotel.cidade),
            joinedload(Hotel.comodidades),
        )
        .order_by(Hotel.nome)
    )

    if cidade_id is not None:
        query = query.where(Hotel.cidade_id == cidade_id)

    if estrelas_min is not None:
        query = query.where(Hotel.categoria_estrelas >= estrelas_min)

    if busca:
        query = query.where(Hotel.nome.ilike(f"%{busca.strip()}%"))

    hoteis = db.scalars(query).unique().all()

    return [
        HotelResponseSchema(
            id=hotel.id,
            nome=hotel.nome,
            cidade_id=hotel.cidade_id,
            cidade=hotel.cidade.nome,
            categoria_estrelas=hotel.categoria_estrelas,
            localizacao=hotel.localizacao,
            comodidades=[
                associacao.comodidade_id
                for associacao in hotel.comodidades
            ],
        )
        for hotel in hoteis
    ]


@router.post(
    "/admin/hoteis",
    response_model=HotelResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def criar_hotel(
    payload: HotelCreateSchema,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_admin),
):
    cidade = db.scalar(select(Cidade).where(Cidade.id == payload.cidade_id))

    if cidade is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cidade não encontrada",
        )

    hotel = Hotel(
        nome=payload.nome.strip(),
        cidade_id=payload.cidade_id,
        categoria_estrelas=payload.categoria_estrelas,
        localizacao=payload.localizacao,
    )
    db.add(hotel)

    try:
        db.commit()
        db.refresh(hotel)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não foi possível cadastrar o hotel",
        )

    return HotelResponseSchema(
        id=hotel.id,
        nome=hotel.nome,
        cidade_id=hotel.cidade_id,
        cidade=cidade.nome,
        categoria_estrelas=hotel.categoria_estrelas,
        localizacao=hotel.localizacao,
        comodidades=[],
    )


@router.get("/quartos", response_model=list[QuartoResponseSchema])
def listar_quartos(db: Session = Depends(get_db)):
    return db.scalars(select(Quarto).order_by(Quarto.hotel_id, Quarto.numero)).all()


@router.post(
    "/admin/quartos",
    response_model=QuartoResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def criar_quarto(
    payload: QuartoCreateSchema,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_admin),
):
    hotel = db.scalar(select(Hotel).where(Hotel.id == payload.hotel_id))

    if hotel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel não encontrado",
        )

    quarto = Quarto(
        hotel_id=payload.hotel_id,
        numero=payload.numero.strip(),
        tipo=payload.tipo.strip(),
        preco_diaria=payload.preco_diaria,
        max_adultos=payload.max_adultos,
        max_criancas=payload.max_criancas,
    )
    db.add(quarto)

    try:
        db.commit()
        db.refresh(quarto)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Número de quarto já cadastrado para este hotel",
        )

    return quarto
