import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import Listings from "../components/Listings";
export default function Offers() {
  const [listings, setListings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchList = async () => {
      try {
        // Get reference
        const listingsRef = collection(db, 'listings')

        // Create a query
        const q = query(
          listingsRef,
          where('offer', '==', true),
          orderBy('timestamp', 'desc'),
          limit(10)
        )

        // Execute query
        const querySnap = await getDocs(q)


        const listings = []

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setListings(listings)
        setIsLoading(false)
      } catch (error) {
        toast.error("Could not fetch Listings");
      }
    }
    fetchList();
  }, [params.categoryName]);
  return (
    <div className="category">
      <header>
        <p className="pageHeader">Offers</p>
      </header>
      {isLoading? <Spinner/>: listings? <>
      <main>
        <ul className="categoryListings">
        {listings.map((listing) => (
                <Listings
                  listing={listing.data}
                  id={listing.id}
                  key={listing.id}
                />
              ))}
        </ul>
      </main>
      </>:<>There are no Offers</>}
    </div>
  );
}
