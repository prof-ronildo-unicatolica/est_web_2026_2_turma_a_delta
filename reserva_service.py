from __future__ import annotations
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.quarto import Quarto
from app.models.reserva import Reserva
from app.models.servico_adicional import ServicoAdicional
from app.models.tarifa_temporada import TarifaTemporada

CENT = Decimal("0.01")

def money(v: Decimal | int | float) -> Decimal:
    return Decimal(str(v)).quantize(CENT, rounding=ROUND_HALF_UP)

@dataclass
class PriceResult:
    diarias: int
    subtotal_diarias: Decimal
    tarifa_multiplicador: Decimal
    early_late: Decimal
    adicional_hospedes: Decimal
    servicos: Decimal
    desconto: Decimal
    total: Decimal


def calcular_preco(db: Session, quarto: Quarto, *, data_checkin: date, data_checkout: date,
                   quantidade_adultos: int, quantidade_criancas: int, quantidade_bebes: int,
                   early_checkin: bool, late_checkout: bool, tarifa_tipo: str,
                   servicos: list[tuple[object, int]] | None = None) -> PriceResult:
    diarias = (data_checkout - data_checkin).days
    if diarias <= 0:
        raise ValueError("O período deve conter pelo menos uma diária")
    if quantidade_adultos < 1:
        raise ValueError("É necessário pelo menos um adulto")
    if quantidade_adultos > quarto.max_adultos:
        raise ValueError(f"Quarto suporta no máximo {quarto.max_adultos} adultos")
    if quantidade_criancas > quarto.max_criancas:
        raise ValueError(f"Quarto suporta no máximo {quarto.max_criancas} crianças")

    # 0-5 anos são representados por quantidade_bebes e são gratuitos.
    # Crianças de 6-12 anos pagam 50% da diária.
    base = money(quarto.preco_diaria) * diarias
    tarifa = db.scalar(select(TarifaTemporada).where(
        TarifaTemporada.hotel_id == quarto.hotel_id,
        TarifaTemporada.data_inicio <= data_checkin,
        TarifaTemporada.data_fim >= data_checkout,
    ).order_by(TarifaTemporada.multiplicador.desc()))
    multiplicador = money(tarifa.multiplicador) if tarifa else Decimal("1.00")
    subtotal = money(base * multiplicador)
    adicional_hospedes = money(base * Decimal("0.50") * quantidade_criancas)
    early_late = money((subtotal + adicional_hospedes) * Decimal("0.30") * int(early_checkin or late_checkout))
    servicos_total = Decimal("0")
    for servico_id, quantidade in servicos or []:
        servico = db.get(ServicoAdicional, servico_id)
        if servico is None:
            raise ValueError(f"Serviço adicional {servico_id} não encontrado")
        servicos_total += money(servico.preco) * quantidade
    bruto = money(subtotal + adicional_hospedes + early_late + servicos_total)
    desconto = money(bruto * Decimal("0.10")) if tarifa_tipo == "Nao Reembolsavel" else Decimal("0.00")
    total = money(bruto - desconto)
    return PriceResult(diarias, subtotal, multiplicador, early_late, adicional_hospedes,
                       money(servicos_total), desconto, total)



def data_limite_cancelamento(data_checkin: date) -> date:
    return data_checkin - timedelta(days=2)


def calcular_multa_cancelamento(reserva: Reserva, hoje: date | None = None) -> Decimal:
    hoje = hoje or date.today()
    if reserva.tarifa_tipo == "Nao Reembolsavel":
        return money(reserva.valor_total)
    if hoje > (reserva.data_checkin - timedelta(days=2)):
        return money(reserva.quarto.preco_diaria)
    return Decimal("0.00")
