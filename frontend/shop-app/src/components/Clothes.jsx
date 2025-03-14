import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClothesItem from "./ClothesItem.jsx";
import ReactSearchBox from "react-search-box";

export default function Clothes() {
  const [loadedClothes, setLoadedClothes] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [enteredFilter, setEnteredFilter] = useState("");
  const [filteredClothes, setFilteredClothes] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();

  const categories = [
    "Sweatshirt",
    "T-shirt",
    "Hat",
    "Shirt",
    "Jacket",
    "Undershirt",
    "Trousers",
    "Accessory",
    "Jeans",
  ];

  useEffect(() => {
    async function fetchClothes() {
      try {
        let url;
        if (enteredFilter) {
          url = `http://localhost:8765/catalog-service/api/catalog/filter-by-names/${enteredFilter}?page=${currentPage}&size=6`;
        } else if (selectedCategory) {
          url = `http://localhost:8765/catalog-service/api/catalog/filter-by-category/${selectedCategory.trim()}`; //lista
        } else {
          url = `http://localhost:8765/catalog-service/api/catalog/products?page=${currentPage}&size=6`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Fail to fetch items");
        }

        const data = await response.json();
        console.log(data);

        if (enteredFilter || selectedCategory) {
          const paginatedData = data.slice(
            currentPage * 6,
            (currentPage + 1) * 6
          );
          setFilteredClothes(paginatedData);
          setTotalPages(data.length > 0 ? Math.ceil(data.length / 6) : 1);
          console.log(totalPages);
        } else {
          setLoadedClothes(data.content);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching clothes:", error);
      }
    }

    fetchClothes();
  }, [currentPage, enteredFilter, selectedCategory]);

  return (
    <>
      <div className="w-[500px] mx-auto flex justify-start gap-2">
        <div className="flex-1">
          <ReactSearchBox
            placeholder="Search..."
            value={enteredFilter} 
            onChange={(value) => {
              setEnteredFilter(value);
              setCurrentPage(0); 
            }}
          />
        </div>

        <div className="relative">
          <button
            className="p-2 rounded-lg bg-yellow-800 text-white"
            onClick={() => setShowCategories((prev) => !prev)}
          >
            Categories
          </button>

          {showCategories && (
            <ul className="absolute mt-2 border rounded-lg shadow-lg w-40 bg-amber-900 overflow-auto max-h-60 z-50">
              {categories.map((category) => (
                <li
                  key={category}
                  className="p-2 hover:bg-amber-800 cursor-pointer"
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(0);
                    setEnteredFilter("");
                    setShowCategories(false);
                  }}
                >
                  {category}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <ul className="w-[90%] max-w-[70rem] my-8 mx-auto p-4 gap-4 flex flex-wrap justify-center">
          {(enteredFilter || selectedCategory
            ? filteredClothes
            : loadedClothes
          ).map((product) => (
            <ClothesItem key={product.id} product={product} />
          ))}
        </ul>

        {/* 🔹 PAGINACJA */}
        <div className="flex justify-center mt-4">
          <button
            className="mx-2 px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </button>

          <span className="mx-4 text-lg font-bold mt-2">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            className="mx-2 px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
            disabled={currentPage + 1 >= totalPages || totalPages === 0}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
