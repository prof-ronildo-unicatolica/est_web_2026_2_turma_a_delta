# app/schemas/mongo/py_object_id.py
"""
Tipo auxiliar para validar/serializar ObjectId do MongoDB (Bson) dentro
de modelos Pydantic v2. Necessário porque o Pydantic não sabe nativamente
lidar com bson.ObjectId.
"""

from typing import Any

from bson import ObjectId
from pydantic import GetCoreSchemaHandler
from pydantic_core import core_schema


class PyObjectId(ObjectId):
    """ObjectId do Bson utilizável como tipo de campo em modelos Pydantic v2."""

    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema(
                [
                    core_schema.is_instance_schema(ObjectId),
                    core_schema.chain_schema(
                        [
                            core_schema.str_schema(),
                            core_schema.no_info_plain_validator_function(cls.validate),
                        ]
                    ),
                ]
            ),
            serialization=core_schema.plain_serializer_function_ser_schema(str),
        )

    @classmethod
    def validate(cls, value: str) -> ObjectId:
        if not ObjectId.is_valid(value):
            raise ValueError(f"'{value}' não é um ObjectId válido")
        return ObjectId(value)