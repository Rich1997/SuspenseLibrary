import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Layers, Search, X, BookOpen } from "lucide-react"
import { getAllSeriesSorted, type SeriesInfo } from "@/lib/authorsAndSeries"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { BrowseTabs } from "@/components/BrowseTabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SortDropdown, type SortOption } from "@/components/SortDropdown"
import { cn } from "@/lib/utils"

type SortOptionType = "name-asc" | "name-desc" | "count-desc"

const SERIES_SORT_OPTIONS: SortOption<SortOptionType>[] = [
  { value: "name-asc", label: "Alphabetical (A-Z)" },
  { value: "name-desc", label: "Alphabetical (Z-A)" },
  { value: "count-desc", label: "Most Episodes" },
]

export const SeriesPage = () => {
  useDocumentTitle("Series")

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL")
  const [sortOption, setSortOption] = useState<SortOptionType>("name-asc")

  const allSeries = useMemo(() => getAllSeriesSorted(), [])

  // Compute available initial letters
  const availableLetters = useMemo(() => {
    const set = new Set<string>()
    allSeries.forEach((s) => set.add(s.initial))
    const sorted = Array.from(set).sort((a, b) => {
      if (a === "#") return 1
      if (b === "#") return -1
      return a.localeCompare(b)
    })
    return ["ALL", ...sorted]
  }, [allSeries])

  // Filter and sort series
  const filteredSeries = useMemo(() => {
    let result = allSeries

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      result = result.filter((s) => s.name.toLowerCase().includes(query))
    }

    // Filter by selected letter (if not 'ALL' and not searching)
    if (selectedLetter !== "ALL" && !searchQuery.trim()) {
      result = result.filter((s) => s.initial === selectedLetter)
    }

    // Sort
    const sorted = [...result]
    if (sortOption === "name-asc") {
      sorted.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      )
    } else if (sortOption === "name-desc") {
      sorted.sort((a, b) =>
        b.name.localeCompare(a.name, undefined, { sensitivity: "base" })
      )
    } else if (sortOption === "count-desc") {
      sorted.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      })
    }

    return sorted
  }, [allSeries, searchQuery, selectedLetter, sortOption])

  // Group series by initial letter if sorting alphabetically and not filtering by query
  const groupedSeries = useMemo(() => {
    if (sortOption === "count-desc" || searchQuery.trim()) {
      return null
    }
    const map = new Map<string, SeriesInfo[]>()
    filteredSeries.forEach((series) => {
      const letter = series.initial
      if (!map.has(letter)) {
        map.set(letter, [])
      }
      map.get(letter)!.push(series)
    })
    return map
  }, [filteredSeries, sortOption, searchQuery])

  return (
    <div className="space-y-6 pb-12">
      <BrowseTabs />

      {/* Header Section */}
      <div className="flex flex-col gap-4 border-b pb-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <Layers className="size-7 text-primary" />
              Series
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Series count: {allSeries.length}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <SortDropdown
              options={SERIES_SORT_OPTIONS}
              value={sortOption}
              onChange={setSortOption}
              ariaLabel="Sort series"
              dropdownLabel="Sort Series By"
            />
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search series by name..."
              className="h-9 w-full rounded-md border border-input bg-background pr-8 pl-9 text-xs focus:ring-1 focus:ring-ring focus:outline-none sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear series search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Alphabet Jump Bar */}
        {!searchQuery.trim() && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="mr-1.5 shrink-0 text-[11px] font-semibold text-muted-foreground">
              Filter Letter:
            </span>
            <div className="flex flex-wrap items-center gap-1 overflow-x-auto py-1">
              {availableLetters.map((letter) => {
                const isActive = selectedLetter === letter
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setSelectedLetter(letter)}
                    className={cn(
                      "min-w-7 cursor-pointer rounded-md px-2 py-0.5 text-center text-xs font-semibold transition-all",
                      isActive
                        ? "bg-primary font-bold text-primary-foreground shadow-xs"
                        : "bg-muted/50 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    {letter}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Series List / Grid */}
      {filteredSeries.length > 0 ? (
        groupedSeries && selectedLetter === "ALL" ? (
          /* Grouped by Alphabet Letter */
          <div className="space-y-8">
            {Array.from(groupedSeries.entries()).map(([letter, seriesList]) => (
              <section key={letter} className="space-y-3">
                <div className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base font-bold text-primary">
                    {letter}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {seriesList.map((series) => (
                    <Link
                      key={series.name}
                      to={`/episodes?q=${encodeURIComponent(series.name)}&scope=series`}
                      className="group flex cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-card/60 p-3.5 text-left shadow-xs transition-all hover:border-primary/40 hover:bg-accent/50 hover:shadow-md"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <h3 className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary sm:text-sm">
                          #{series.name}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <BookOpen className="size-3 shrink-0" />
                          <span>
                            {series.count}{" "}
                            {series.count === 1 ? "episode" : "episodes"}
                          </span>
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[10px] font-medium group-hover:border-primary/50"
                      >
                        {series.count}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Flat Grid for filtered / custom sorted views */
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredSeries.map((series) => (
              <Link
                key={series.name}
                to={`/episodes?q=${encodeURIComponent(series.name)}&scope=series`}
                className="group flex cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-card/60 p-3.5 text-left shadow-xs transition-all hover:border-primary/40 hover:bg-accent/50 hover:shadow-md"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary sm:text-sm">
                    #{series.name}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <BookOpen className="size-3 shrink-0" />
                    <span>
                      {series.count}{" "}
                      {series.count === 1 ? "episode" : "episodes"}
                    </span>
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 text-[10px] font-medium group-hover:border-primary/50"
                >
                  {series.count}
                </Badge>
              </Link>
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="space-y-4 rounded-xl border border-dashed bg-card/40 p-6 py-16 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              No series found matching &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="mx-auto max-w-md text-xs text-muted-foreground">
              We couldn&apos;t find any series matching your search. Try
              searching for a different name or clear filters.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setSelectedLetter("ALL")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SeriesPage
