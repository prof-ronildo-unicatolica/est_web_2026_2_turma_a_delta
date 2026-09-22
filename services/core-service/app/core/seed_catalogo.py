from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.cidade import Cidade
from app.models.hotel import Hotel
from app.models.quarto import Quarto


def seed_catalogo() -> None:
    db: Session = SessionLocal()

    try:
        cidades = {
            "Quixadá": "CE",
            "Fortaleza": "CE",
            "Canindé": "CE",
        }

        cidades_db: dict[str, Cidade] = {}

        for nome, estado in cidades.items():
            cidade = db.scalar(select(Cidade).where(Cidade.nome == nome))

            if cidade is None:
                cidade = Cidade(
                    nome=nome,
                    estado=estado,
                    limite_territorial={},
                )
                db.add(cidade)
                db.flush()

            cidades_db[nome] = cidade

        hoteis = {
            "Hotel Monólitos": "Quixadá",
            "Hotel Vale das Pedras": "Fortaleza",
            "Hotel Sertão Premium": "Canindé",
        }

        hoteis_db: dict[str, Hotel] = {}

        for nome, cidade_nome in hoteis.items():
            hotel = db.scalar(select(Hotel).where(Hotel.nome == nome))

            if hotel is None:
                hotel = Hotel(
                    nome=nome,
                    cidade_id=cidades_db[cidade_nome].id,
                    categoria_estrelas=3,
                )
                db.add(hotel)
                db.flush()

            hoteis_db[nome] = hotel

        quartos = [
            ("Hotel Monólitos", "101", "Casal", 2),
            ("Hotel Vale das Pedras", "201", "Luxo", 2),
            ("Hotel Sertão Premium", "301", "Família", 4),
        ]

        for hotel_nome, numero, tipo, max_adultos in quartos:
            quarto = db.scalar(
                select(Quarto).where(
                    Quarto.hotel_id == hoteis_db[hotel_nome].id,
                    Quarto.numero == numero,
                )
            )

            if quarto is None:
                db.add(
                    Quarto(
                        hotel_id=hoteis_db[hotel_nome].id,
                        numero=numero,
                        tipo=tipo,
                        preco_diaria=0,
                        max_adultos=max_adultos,
                        max_criancas=0,
                    )
                )

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
