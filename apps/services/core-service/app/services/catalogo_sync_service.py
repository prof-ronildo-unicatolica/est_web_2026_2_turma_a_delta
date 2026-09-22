async def sync_catalogo(self) -> int:
    hoteis = self.db.query(Hotel).all()

    sincronizados = 0

    for hotel in hoteis:
        try:
            await self.sincronizar_hotel(hotel.id)
            sincronizados += 1
        except ValueError:
            # Ignora hotéis que ainda não possuem dados válidos
            continue

    return sincronizados
    