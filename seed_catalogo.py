from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.usuario import Usuario
from app.models.cidade import Cidade
from app.models.hotel import Hotel
from app.models.quarto import Quarto
from app.models.comodidade import Comodidade
from app.models.hotel_comodidade import HotelComodidade
from app.models.servico_adicional import ServicoAdicional
from app.models.tarifa_temporada import TarifaTemporada

def seed_catalogo():
    db: Session = SessionLocal()
    try:
        admin=db.scalar(select(Usuario).where(Usuario.email=='admin@hotel.com'))
        if admin is None:
            db.add(Usuario(nome='Administrador', email='admin@hotel.com', senha_hash=hash_password('admin123'), is_admin=True)); db.flush()
        cidades={}
        for nome,estado in [('Quixadá','CE'),('Fortaleza','CE'),('Canindé','CE')]:
            c=db.scalar(select(Cidade).where(Cidade.nome==nome))
            if c is None: c=Cidade(nome=nome,estado=estado,limite_territorial={}); db.add(c); db.flush()
            cidades[nome]=c
        defs=[('Hotel Monólitos','Quixadá',3,180,[ -39.0, -4.97]),('Hotel Vale das Pedras','Fortaleza',4,320,[-38.52,-3.73]),('Hotel Sertão Premium','Canindé',5,450,[-39.31,-4.36])]
        for nome,cidade,stars,price,coords in defs:
            h=db.scalar(select(Hotel).where(Hotel.nome==nome))
            if h is None: h=Hotel(nome=nome,cidade_id=cidades[cidade].id,categoria_estrelas=stars,localizacao={'type':'Point','coordinates':coords}); db.add(h); db.flush()
            elif not h.localizacao: h.localizacao={'type':'Point','coordinates':coords}
            q=db.scalar(select(Quarto).where(Quarto.hotel_id==h.id,Quarto.numero=='101'))
            if q is None: db.add(Quarto(hotel_id=h.id,numero='101',tipo='Standard',preco_diaria=Decimal(price),max_adultos=2,max_criancas=2))
        for nome,price in [('Café da manhã',35),('Estacionamento',25),('Transfer aeroporto',80)]:
            s=db.scalar(select(ServicoAdicional).where(ServicoAdicional.nome==nome))
            if s is None: db.add(ServicoAdicional(nome=nome,preco=Decimal(price)))
        db.commit()
    except Exception:
        db.rollback(); raise
    finally: db.close()
