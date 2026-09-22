from datetime import date
from decimal import Decimal
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import get_current_admin, get_current_user
from app.core.database import get_db
from app.models.tarifa_temporada import TarifaTemporada
from app.models.servico_adicional import ServicoAdicional
from app.models.quarto import Quarto
from app.models.usuario import Usuario
from app.services.reserva_service import calcular_preco

router=APIRouter(prefix="/precos",tags=["Precificação"])
class TarifaIn(BaseModel):
    hotel_id: UUID; nome: str=Field(min_length=1,max_length=100); data_inicio: date; data_fim: date; multiplicador: Decimal=Field(gt=0)
class ServicoIn(BaseModel):
    nome: str=Field(min_length=1,max_length=100); preco: Decimal=Field(ge=0)
class PrecoPreview(BaseModel):
    quarto_id: UUID; data_checkin: date; data_checkout: date; quantidade_adultos: int=Field(ge=1); quantidade_criancas:int=Field(ge=0); quantidade_bebes:int=Field(ge=0); early_checkin:bool=False; late_checkout:bool=False; tarifa_tipo:str="Reembolsavel"

@router.post('/admin/tarifas',dependencies=[Depends(get_current_admin)])
def criar_tarifa(p:TarifaIn,db:Session=Depends(get_db)):
    t=TarifaTemporada(**p.model_dump()); db.add(t); db.commit(); db.refresh(t); return t
@router.get('/tarifas')
def listar_tarifas(db:Session=Depends(get_db),_:Usuario=Depends(get_current_user)):
    return db.scalars(select(TarifaTemporada).order_by(TarifaTemporada.data_inicio)).all()
@router.post('/admin/servicos',dependencies=[Depends(get_current_admin)])
def criar_servico(p:ServicoIn,db:Session=Depends(get_db)):
    s=ServicoAdicional(**p.model_dump()); db.add(s); db.commit(); db.refresh(s); return s
@router.get('/servicos')
def listar_servicos(db:Session=Depends(get_db),_:Usuario=Depends(get_current_user)):
    return db.scalars(select(ServicoAdicional).order_by(ServicoAdicional.nome)).all()
@router.post('/preview')
def preview(p:PrecoPreview,db:Session=Depends(get_db),_:Usuario=Depends(get_current_user)):
    q=db.get(Quarto,p.quarto_id)
    if not q: raise HTTPException(404,'Quarto não encontrado')
    try:
        r=calcular_preco(db,q,**p.model_dump(exclude={'quarto_id'}),servicos=[])
    except ValueError as exc: raise HTTPException(422,str(exc))
    return {'diarias':r.diarias,'subtotal_diarias':r.subtotal_diarias,'tarifa_multiplicador':r.tarifa_multiplicador,'early_late':r.early_late,'adicional_hospedes':r.adicional_hospedes,'servicos':r.servicos,'desconto':r.desconto,'total':r.total}
