import uuid
from datetime import date
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

TarifaTipo = Literal["Reembolsavel", "Nao Reembolsavel"]


class ReservaCreateSchema(BaseModel):
    """Dados recebidos do frontend para criar uma reserva.

    `usuario_id`, `valor_total`, `status` e demais campos calculados
    NÃO são recebidos do cliente: são derivados no servidor a partir do
    usuário autenticado (JWT) e do quarto selecionado, evitando que o
    cliente manipule preço ou dono da reserva.
    """

    quarto_id: uuid.UUID
    data_checkin: date
    data_checkout: date
    quantidade_adultos: int = Field(ge=1)
    quantidade_criancas: int = Field(default=0, ge=0)
    quantidade_bebes: int = Field(default=0, ge=0)
    early_checkin: bool = False
    late_checkout: bool = False
    necessita_berco: bool = False
    tarifa_tipo: TarifaTipo = "Reembolsavel"

    @model_validator(mode="after")
    def validar_datas(self):
        if self.data_checkout <= self.data_checkin:
            raise ValueError(
                "A data de check-out deve ser posterior à data de check-in."
            )
        return self


class ReservaResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    usuario_id: uuid.UUID
    quarto_id: uuid.UUID
    data_checkin: date
    data_checkout: date
    quantidade_adultos: int
    quantidade_criancas: int
    quantidade_bebes: int
    early_checkin: bool
    late_checkout: bool
    necessita_berco: bool
    tarifa_tipo: str
    data_limite_cancelamento: Optional[date]
    valor_multa_cancelamento: Decimal
    valor_total: Decimal
    status: str
