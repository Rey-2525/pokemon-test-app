"use client";

import { Search } from "lucide-react";

// interface PokemonSearchProps {
//   onSearch: (query: string) => void;
// }

export default function PokemonSearch() {

  return (
    <div className="bg-red-500 p-4">
      <div className="flex items-center gap-4">
        {/* Menu icon */}
        {/* <div className="text-white">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current"
          >
            <path
              d="M3 6h18M3 12h18M3 18h18"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div> */}

        {/* Title */}
        <h1 className="text-white text-lg font-bold flex-1">Pokédex</h1>

        {/* Search icon */}
        <Search className="text-white w-6 h-6" />
      </div>

      {/* Search bar */}
      {/* <div className="mt-4 relative">
        <Input
          type="text"
          placeholder="ポケモンの名前を検索..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full bg-white rounded-lg pl-4 pr-10 py-3 text-gray-600 placeholder-gray-400 border-0"
        />
      </div> */}
    </div>
  );
}
