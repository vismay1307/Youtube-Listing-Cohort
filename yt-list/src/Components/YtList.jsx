import { useEffect, useState } from 'react'

const formatDuration = (iso) => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  const h = parseInt(match[1] || 0)
  const m = parseInt(match[2] || 0)
  const s = parseInt(match[3] || 0)
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${m}:${String(s).padStart(2,'0')}`
}

const formatViews = (n) => {
  const num = parseInt(n)
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num
}

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
  if (diff < 7) return `${diff} days ago`
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`
  if (diff < 365) return `${Math.floor(diff / 30)} months ago`
  return `${Math.floor(diff / 365)} years ago`
}

const YtList = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://api.freeapi.app/api/v1/public/youtube/videos?page=${page}&limit=12`)
        const data = await res.json()
        setVideos(data.data.data)
        setTotalPages(data.data.totalPages)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [page])

  const filtered = videos.filter(v =>
    v.items.snippet.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/8 px-6 py-3 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-1.5 mr-4 shrink-0">
          
          <span className="font-semibold text-base tracking-tight">Chai Aur Cohort</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full overflow-hidden">
            <input
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-slate-500 outline-none"
            />
            <div className="px-4 py-2 border-l border-white/10 text-slate-400 text-sm">🔍</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full aspect-video bg-white/8 rounded-xl mb-3" />
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/8 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/8 rounded-full w-full" />
                    <div className="h-3 bg-white/8 rounded-full w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {filtered.map((v) => {
              const s = v.items.snippet
              const stats = v.items.statistics
              const duration = formatDuration(v.items.contentDetails.duration)
              return (
                <a
                  key={v.items.id}
                  href={`https://youtube.com/watch?v=${v.items.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5 mb-3">
                    <img
                      src={s.thumbnails.medium.url}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                    />
                    {/* Duration badge */}
                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
                      {duration}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex gap-3">
                    {/* Channel avatar */}
                    <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center shrink-0 text-sm font-semibold">
                      H
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-medium leading-snug line-clamp-2 text-white group-hover:text-white/80 transition-colors">
                        {s.title}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1">{s.channelTitle}</p>
                      <p className="text-slate-500 text-xs">
                        {formatViews(stats.viewCount)} views · {timeAgo(s.publishedAt)}
                      </p>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-300
                         hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-300
                         hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default YtList