import { useState, useEffect, useRef } from "react";
import fetchHandler from "../../utils/fetchHandler";

const SearchBar = ({ timezone, setTZ }: any) => {
    const [timezones, setTimezones] = useState<{ name: string; utc_offset: string; country_code: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchHandler(`search_timezone/${timezone.length > 0 ? `?q=${timezone}` : ""}`, "GET", ({ data }) => setTimezones(data));
    }, [timezone]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="timezone_search_bar" ref={searchRef}>
            <input
                type="text"
                value={timezone}
                onChange={(e) => setTZ(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Pesquisar..."
            />
            {showSuggestions && timezones.length > 0 && (
                <ul className="suggestions">
                    {timezones.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => {
                                setTZ(`${suggestion.country_code} ${suggestion.name} ${suggestion.utc_offset}`);
                                setShowSuggestions(false);
                            }}
                        >
                            <span>{suggestion.country_code}</span> <span>{suggestion.name}</span> <span>{suggestion.utc_offset}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
