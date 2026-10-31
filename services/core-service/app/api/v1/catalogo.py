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


@router.put(
    "/admin/cidades/{cidade_id}",
    response_model=CidadeResponseSchema,
)
def atualizar_cidade(
    cidade_id: UUID,
    payload: CidadeCreateSchema,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_admin),
):
    cidade = db.get(Cidade, cidade_id)

    if cidade is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cidade não encontrada",
        )

    cidade.nome = payload.nome.strip()
    cidade.estado = payload.estado.strip().upper()
    cidade.limite_territorial = payload.limite_territorial

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


@router.delete(
    "/admin/cidades/{cidade_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remover_cidade(
    cidade_id: UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_admin),
):
    cidade = db.scalar(
        select(Cidade)
        .where(Cidade.id == cidade_id)
        .with_for_update()
    )

    if cidade is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cidade não encontrada",
        )

    possui_hoteis = db.scalar(
        select(Hotel.id)
        .where(Hotel.cidade_id == cidade_id)
        .limit(1)
    )

    if possui_hoteis:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não é possível remover uma cidade que possui hotéis.",
        )

    db.delete(cidade)
    db.commit()


@router.get(
    "/comodidades",
    response_model=list[ComodidadeResponseSchema],
)
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


@router.get(
    "/hoteis/{hotel_id}",
    response_model=HotelResponseSchema,
)
def obter_hotel(
    hotel_id: UUID,
    db: Session = Depends(get_db),
):
    hotel = db.scalar(
        select(Hotel)
        .options(
            joinedload(Hotel.cidade),
            joinedload(Hotel.comodidades),
        )
        .where(Hotel.id == hotel_id)
    )

    if hotel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel não encontrado",
        )

    return HotelResponseSchema(
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
    cidade = db.scalar(
        select(Cidade).where(Cidade.id == payload.cidade_id)
    )

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


@router.put(
    "/admin/hoteis/{hotel_id}",
    response_model=HotelResponseSchema,
)
def atualizar_hotel(
    hotel_id: UUID,
    payload: HotelCreateSchema,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_admin),
):
    hotel = db.get(Hotel, hotel_id)

    if hotel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel não encontrado",
        )

    cidade = db.get(Cidade, payload.cidade_id)

    if cidade is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cidade não encontrada",
        )

    hotel.nome = payload.nome.strip()
    hotel.cidade_id = payload.cidade_id
    hotel.categoria_estrelas = payload.categoria_estrelas
    hotel.localizacao = payload.localizacao

    try:
        db.commit()
        db.refresh(hotel)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não foi possível atualizar o hotel",
        )

    return HotelResponseSchema(
        id=hotel.id,
        nome=hotel.nome,
        cidade_id=hotel.cidade_id,
        cidade=cidade.nome,
        categoria_estrelas=hotel.categoria_estrelas,
        localizacao=hotel.localizacao,
        comodidades=[
            associacao.comodidade_id
            for associacao in hotel.comodidades
        ],
    )


@router.delete(
    "/admin/hoteis/{hotel_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remover_hotel(
    hotel_id: UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_admin),
):
    hotel = db.scalar(
        select(Hotel)
        .where(Hotel.id == hotel_id)
        .with_for_update()
    )

    if hotel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel não encontrado",
        )

    possui_quartos = db.scalar(
        select(Quarto.id)
        .where(Quarto.hotel_id == hotel_id)
        .limit(1)
    )

    if possui_quartos:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não é possível remover um hotel que possui quartos cadastrados.",
        )

    db.delete(hotel)
    db.commit()


@router.get(
    "/quartos",
    response_model=list[QuartoResponseSchema],
)
def listar_quartos(db: Session = Depends(get_db)):
    return db.scalars(
        select(Quarto).order_by(Quarto.hotel_id, Quarto.numero)
    ).all()


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
    hotel = db.scalar(
        select(Hotel).where(Hotel.id == payload.hotel_id)
    )

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