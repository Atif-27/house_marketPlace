import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";

import ShareIcon from "../assets/svg/shareIcon.svg";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

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
      {/* SLIDE SHOW */}
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
        <p className="discountPrice">
          $ {listing.offer && listing.discountedPrice} Offer
        </p>
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
        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingLocation=${listing.location}`}
            className="primaryButton"
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  );
}
