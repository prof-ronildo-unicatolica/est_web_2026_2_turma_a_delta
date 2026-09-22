from datetime import date
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, model_validator

class ReservaServicoInput(BaseModel):
    servico_id: UUID
    quantidade: int = Field(default=1, ge=1)

class ReservaCreate(BaseModel):
    quarto_id: UUID
    data_checkin: date
    data_checkout: date
    quantidade_adultos: int = Field(ge=1)
    quantidade_criancas: int = Field(default=0, ge=0)
    quantidade_bebes: int = Field(default=0, ge=0)
    early_checkin: bool = False
    late_checkout: bool = False
    necessita_berco: bool = False
    tarifa_tipo: str = Field(default="Reembolsavel", pattern="^(Reembolsavel|Nao Reembolsavel)$")
    servicos: list[ReservaServicoInput] = Field(default_factory=list)

    @model_validator(mode="after")
    def validar_datas(self):
        if self.data_checkout <= self.data_checkin:
            raise ValueError("data_checkout deve ser posterior a data_checkin")
        return self

class ReservaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    usuario_id: UUID
    quarto_id: UUID
    data_checkin: date
    data_checkout: date
    quantidade_adultos: int
    quantidade_criancas: int
    quantidade_bebes: int
    early_checkin: bool
    late_checkout: bool
    necessita_berco: bool
    tarifa_tipo: str
    data_limite_cancelamento: date | None
    valor_multa_cancelamento: Decimal
    valor_total: Decimal
    status: str

class ReservaCancelamentoResponse(BaseModel):
    reserva: ReservaResponse
    multa: Decimal
    reembolso_estimado: Decimal
    mensagem: str
