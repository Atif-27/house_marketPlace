import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebase.config";
import Spinner from "./Spinner";

// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { useNavigate } from "react-router-dom";
export default function Slider() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);
  useEffect(() => {
    async function fetchLatestListing() {
      const listingsRef = collection(db, "listings");
      const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5));
      const querySnap = await getDocs(q);

      let listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings(listings);
      setLoading(false);
    }

    fetchLatestListing();
  }, []);
  if (loading) return <Spinner />;
  return (
    <div>
      {listings && (
        <Swiper
          // install Swiper modules
          modules={[Navigation, Pagination, Scrollbar, A11y]}
          spaceBetween={50}
          navigation
          pagination={{ clickable: true }}
          scrollbar={{ draggable: true }}
          slidesPerView={1}
        >
          {listings.map(({ data, id }) => (
            <SwiperSlide key={id}>
              <div className="swiperSlideDiv">
                <img
                  src={data.imgUrls[0]}
                  alt=""
                  style={{
                    maxHeight: "400px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                  //   className="swiperSlideImg"
                  onClick={() => navigate(`/category/${data.type}/${id}`)}
                />
                <p className="swiperSlideText">{data.name}</p>
                <p className="swiperSlidePrice">
                  ${data.discountedPrice ?? data.regularPrice}{" "}
                  {data.type === "rent" && "/ month"}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
