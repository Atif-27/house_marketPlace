import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";

import ShareIcon from "../assets/svg/shareIcon.svg";
import { Zoom, toast } from "react-toastify";
import Spinner from "../components/Spinner";

import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";

// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const params = useParams();
  const auth = getAuth();
  useEffect(
    function () {
      async function fetchListing() {
        const docRef = doc(db, "listings", params.listingId);
        const docSnapShot = await getDoc(docRef);
        if (docSnapShot.exists) {
          setListing(docSnapShot.data());
          setLoading(false);
        }
      }
      fetchListing();
    },
    [params.listingId]
  );
  if (loading) {
    return <Spinner />;
  }
  return (
    <main>
      <Swiper
        // install Swiper modules
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={50}
        navigation
        pagination={{ clickable: true }}
        scrollbar={{ draggable: true }}
        slidesPerView={1}
      >
        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div className="swiperSlideDiv">
              <img
                src={url}
                alt=""
                style={{
                  maxHeight: "500px",
                  width: "100%",
                  objectFit: "cover",
                }}
                // className="swiperSlideImg"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => setShareLinkCopied(false), 2000);
        }}
      >
        <img src={ShareIcon} alt="" />
      </div>
      {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}
      <div className="listingDetails">
        <p className="listingName">
          {listing.name} - ${" "}
          {listing.offer ? listing.discountedPrice : listing.regularPrice}
        </p>
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType">
          For {listing.type === "rent" ? "Rent" : "Sale"}
        </p>
        {listing.offer && (
          <p className="discountPrice">
            $ {listing.regularPrice - listing.discountedPrice}
          </p>
        )}

        <ul className="listingDetailsList">
          <li>
            {listing.bedrooms}
            {listing.bedrooms > 1 ? ` Bedrooms` : ` Bedroom`}
          </li>
          <li>
            {listing.bathrooms}
            {listing.bathrooms > 1 ? ` Bathrooms` : ` Bathroom`}
          </li>
          <li>{listing.parking && "Parking Spot"}</li>
          <li>{listing.furnished && "Furnished"}</li>
        </ul>
        <p className="listingLocationTitle">Location</p>
        {/* MAP */}
        <div className="leafletContainer">
          <MapContainer
            style={{ height: "100%", width: "100%" }}
            center={[listing?.geolocation.lat, listing?.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[listing?.geolocation.lat, listing?.geolocation.lng]}
            >
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>
        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className="primaryButton"
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  );
}
