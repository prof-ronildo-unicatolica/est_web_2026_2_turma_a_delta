export function HotelCardSkeleton() {
  return (
    <div className="col" aria-hidden="true">
      <div className="card h-100 hotel-card">
        <div className="skeleton" style={{ height: 150 }}></div>
        <div className="card-body">
          <div className="skeleton mb-2" style={{ height: 22, width: '70%' }}></div>
          <div className="skeleton mb-3" style={{ height: 14, width: '40%' }}></div>
          <div className="skeleton mb-2" style={{ height: 14, width: '90%' }}></div>
          <div className="skeleton" style={{ height: 34, width: '100%', marginTop: 24 }}></div>
        </div>
      </div>
    </div>
  )
}

export function BlockSkeleton({ height = 120 }) {
  return <div className="skeleton" style={{ height }} aria-hidden="true"></div>
}
