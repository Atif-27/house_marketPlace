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
  const [lastFetchedListing, setLastFetchedListing] = useState(null);

  const params = useParams();

  useEffect(() => {
    async function fetchList() {
      try {
        // Get reference
        const listingsRef = collection(db, "listings");

        // Create a query
        const q = query(
          listingsRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(1)
        );

        // Execute query
        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastVisible);
        const listings = [];

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        setIsLoading(false);
      } catch (error) {
        toast.error("Could not fetch Listings");
      }
    }
    fetchList();
  }, [params.categoryName]);
  // ! PAGINAION
  async function onFetch() {
    try {
      // Get reference
      const listingsRef = collection(db, "listings");

      // Create a query
      const q = query(
        listingsRef,
        where("offer", "==", true),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(10)
      );

      // Execute query
      const querySnap = await getDocs(q);
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchedListing(lastVisible);
      const list = [];

      querySnap.forEach((doc) => {
        return list.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings((listings) => [...listings, ...list]);
      setIsLoading(false);
    } catch (error) {
      toast.error("Could not fetch Listings");
    }
  }
  return (
    <div className="category">
      <header>
        <p className="pageHeader">Offers</p>
      </header>
      {isLoading ? (
        <Spinner />
      ) : listings ? (
        <>
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
          {lastFetchedListing && (
            <p className="loadMore" onClick={onFetch}>
              Load More
            </p>
          )}
        </>
      ) : (
        <>There are no Offers</>
      )}
    </div>
  );
}
