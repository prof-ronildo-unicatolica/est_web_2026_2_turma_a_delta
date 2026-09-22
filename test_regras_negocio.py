from datetime import date, timedelta
from decimal import Decimal
from types import SimpleNamespace

from app.services.reserva_service import calcular_multa_cancelamento, calcular_preco

class FakeDB:
    def __init__(self, tarifa=None, servicos=None):
        self.tarifa=tarifa; self.servicos=servicos or {}
    def scalar(self, _query): return self.tarifa
    def get(self, _model, ident): return self.servicos.get(ident)

def quarto():
    return SimpleNamespace(preco_diaria=Decimal('100.00'), max_adultos=2, max_criancas=2, hotel_id='hotel')

def reserva(tipo='Reembolsavel', dias=10):
    return SimpleNamespace(tarifa_tipo=tipo, valor_total=Decimal('300.00'), data_checkin=date(2026,10,20), quarto=quarto())

def test_bebe_gratis_e_crianca_meia_diaria():
    r=calcular_preco(FakeDB(), quarto(), data_checkin=date(2026,10,1), data_checkout=date(2026,10,3), quantidade_adultos=1, quantidade_criancas=1, quantidade_bebes=1, early_checkin=False, late_checkout=False, tarifa_tipo='Reembolsavel')
    assert r.diarias == 2
    assert r.total == Decimal('300.00')

def test_early_e_late_aplicam_30_porcento_uma_vez():
    r=calcular_preco(FakeDB(), quarto(), data_checkin=date(2026,10,1), data_checkout=date(2026,10,2), quantidade_adultos=1, quantidade_criancas=0, quantidade_bebes=0, early_checkin=True, late_checkout=True, tarifa_tipo='Reembolsavel')
    assert r.total == Decimal('130.00')

def test_nao_reembolsavel_tem_10_porcento_desconto():
    r=calcular_preco(FakeDB(), quarto(), data_checkin=date(2026,10,1), data_checkout=date(2026,10,2), quantidade_adultos=1, quantidade_criancas=0, quantidade_bebes=0, early_checkin=False, late_checkout=False, tarifa_tipo='Nao Reembolsavel')
    assert r.total == Decimal('90.00')

def test_cancelamento_reembolsavel_antes_de_48h_sem_multa():
    r=reserva('Reembolsavel')
    assert calcular_multa_cancelamento(r, date(2026,10,17)) == Decimal('0.00')

def test_cancelamento_reembolsavel_tardio_multa_de_uma_diaria():
    r=reserva('Reembolsavel')
    assert calcular_multa_cancelamento(r, date(2026,10,19)) == Decimal('100.00')

def test_cancelamento_nao_reembolsavel_multa_total():
    r=reserva('Nao Reembolsavel')
    assert calcular_multa_cancelamento(r, date(2026,10,1)) == Decimal('300.00')

def test_tarifa_temporada_multiplica_diaria():
    tarifa=SimpleNamespace(multiplicador=Decimal('1.50'))
    r=calcular_preco(FakeDB(tarifa=tarifa), quarto(), data_checkin=date(2026,12,1), data_checkout=date(2026,12,2), quantidade_adultos=1, quantidade_criancas=0, quantidade_bebes=0, early_checkin=False, late_checkout=False, tarifa_tipo='Reembolsavel')
    assert r.total == Decimal('150.00')
