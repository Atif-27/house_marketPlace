import { useEffect, useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { db } from "../firebase.config";
import { useNavigate, Link } from "react-router-dom";
import {
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  collection,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";

import Listings from "../components/Listings";

import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import homeIcon from "../assets/svg/homeIcon.svg";
import Spinner from "../components/Spinner";

export default function Profile() {
  const auth = getAuth();

  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const { name, email } = formData;

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserListing() {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);

      const listing = [];
      querySnap.forEach((doc) =>
        listing.push({ id: doc.id, data: doc.data() })
      );
      setListing(listing);
      setLoading(false);
    }
    fetchUserListing();
  }, [auth.currentUser.uid]);
  const onLogout = () => {
    auth.signOut();
    navigate("/");
  };

  async function onSubmit() {
    try {
      if (auth.currentUser.displayName !== name) {
        // Update display name in fb
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        // Update in firestore
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          name,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Could not update profile details");
    }
  }

  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }
  async function onDelete(listingId) {
    if (window.confirm("Are you sure want to delete the listing")) {
      const docRef = doc(db, "listings", listingId);
      await deleteDoc(docRef);
      const updatedListing = listing.filter(
        (listing) => listing.id !== listingId
      );
      setListing(updatedListing);
      toast.success("Succesfully deleted Listing");
    }
  }
  function onEdit(listingId) {
    navigate(`/edit-listing/${listingId}`);
  }
  if (loading) return <Spinner />;
  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? "done" : "change"}
          </p>
        </div>

        <div className="profileCard">
          <form>
            <input
              type="text"
              id="name"
              className={!changeDetails ? "profileName" : "profileNameActive"}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type="email"
              id="email"
              className={!changeDetails ? "profileEmail" : "profileEmailActive"}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>
        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="" />
          <p>Sell or Rent your home</p>
          <img src={arrowRight} alt="" />
        </Link>

        {listing && listing.length > 0 ? (
          <>
            <p className="listingText">Your Listings</p>
            {listing.map((listing) => (
              <Listings
                key={listing.id}
                listing={listing.data}
                id={listing.id}
                onDelete={() => onDelete(listing.id)}
                onEdit={() => onEdit(listing.id)}
              />
            ))}
          </>
        ) : (
          <>
            <p>You have No Listings Yet</p>
          </>
        )}
      </main>
    </div>
  );
}
