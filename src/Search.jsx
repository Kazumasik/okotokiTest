import React, { useState, useEffect, useRef } from "react";
import Dropdown from "./components/Dropdown";
import styles from "./search.module.css";
import Fuse from "fuse.js";
import { SearchIcon } from "./assets/SearchIcon";
import { SpinIcon } from "./assets/SpinIcon";
import { StarIcon } from "./assets/StarIcon";
import VirtualList from "./components/VirtualList";
import {useFetch} from "./lib/hooks";

const itemHeight = 42;
const listHeight = 350;
const fuseOptions = {
  includeScore: true,
  threshold: 0.3,
};

const Search = () => {
  const { data: coins, loading, error } = useFetch("https://api-eu.okotoki.com/coins");
  const [isActiveBtn, setIsActiveBtn] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [favoriteCoins, setFavoriteCoins] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const listToSearch = activeTab === "all" ? coins : favoriteCoins;

    if (query === "") {
      setFilteredOptions(listToSearch);
    } else {
      const fuse = new Fuse(listToSearch, fuseOptions);
      const results = fuse.search(query).map(({ item }) => item);
      setFilteredOptions(results);
    }
  }, [coins, query, activeTab, favoriteCoins]);

  const handleDropDown = (isActiveBtn) => {
    if (isActiveBtn && inputRef.current) {
      inputRef.current.focus();
    }
    setIsActiveBtn(isActiveBtn);
  };

  const handleToggleFavorite = (e, item) => {
    e.stopPropagation();
    if (favoriteCoins.includes(item)) {
      setFavoriteCoins((prev) => prev.filter((i) => i !== item));
    } else {
      setFavoriteCoins((prev) => [...prev, item]);
    }
  };

  const handleItemClick = (e, item) => {
    setQuery(item);
  };

  return (
    <div className={styles.container}>
      <button
        ref={buttonRef}
        className={`${styles.button} ${isActiveBtn && styles.buttonActive}`}
        aria-haspopup="listbox"
        aria-expanded={isActiveBtn}
        onClick={() => handleDropDown(!isActiveBtn)}
      >
        <SearchIcon className={styles.buttonIcon} />
        Search
      </button>
      <Dropdown offset={3} onOpenChange={handleDropDown} triggerRef={buttonRef}>
        <>
          <div className={styles.inputWrapper}>
            <SearchIcon className={styles.inputIcon} />
            <input
              ref={inputRef}
              autoComplete="off"
              placeholder="Search..."
              className={styles.input}
              value={query}
              name="search"
              type="search"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search"
            />
          </div>
          <div className={styles.tabs} role="tablist">
            <button
              role="tab"
              className={`${styles.tab} ${activeTab !== "all" ? styles.tabActive : ""}`}
              disabled={activeTab === "favorites"}
              onClick={() => setActiveTab("favorites")}
            >
              <StarIcon fill={true} />
              Favorites
            </button>
            <button
              role="tab"
              className={`${styles.tab} ${activeTab === "all" ? styles.tabActive : ""}`}
              disabled={activeTab === "all"}
              onClick={() => setActiveTab("all")}
            >
              All items
            </button>
          </div>
          {error && <div className={styles.wrapper}>{error}</div>}

          {loading && (
            <div className={styles.wrapper}>
              <SpinIcon className="rotating" />
            </div>
          )}
          {!loading && !error && (
            <VirtualList
              items={filteredOptions}
              itemHeight={itemHeight}
              listHeight={listHeight}
              renderItem={(item, offsetTop) => {
                const isFavorite = favoriteCoins.includes(item);
                return (
                  <li
                    key={item}
                    role="listitem"
                    onClick={(e) => handleItemClick(e, item)}
                    style={{ transform: `translateY(${offsetTop}px)`, height: itemHeight }}
                    className={styles.item}
                  >
                    <a href="#" className={styles.itemLink}>
                      <button
                        aria-label={`Toggle favorite for ${item}`}
                        className={styles.itemButton}
                        onClick={(e) => handleToggleFavorite(e, item)}
                      >
                        <StarIcon fill={isFavorite} />
                      </button>
                      {item}
                    </a>
                  </li>
                );
              }}
            />
          )}
        </>
      </Dropdown>
    </div>
  );
};

export default Search;
