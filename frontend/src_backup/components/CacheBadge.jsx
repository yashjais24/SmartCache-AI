function CacheBadge({ hit }) {
  return (
    <span className={`cache-badge ${hit ? "hit" : "miss"}`}>
      {hit ? "CACHE HIT" : "CACHE MISS"}
    </span>
  );
}

export default CacheBadge;