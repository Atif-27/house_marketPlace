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
export default function Category() {
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
          where("type", "==", params.categoryName),
          orderBy("timestamp", "desc"),
          limit(2)
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
  async function onFetch() {
    try {
      // Get reference
      const listingsRef = collection(db, "listings");

      // Create a query
      const q = query(
        listingsRef,
        where("type", "==", params.categoryName),
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
        <p className="pageHeader">
          {params.categoryName === "rent"
            ? "Places For Rent"
            : "Places For Sale"}
        </p>
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
          <br />
          <br />
          {lastFetchedListing && (
            <p className="loadMore" onClick={onFetch}>
              Load More
            </p>
          )}
        </>
      ) : (
        <>{`No Listings Found For ${params.categoryName}`}</>
      )}
    </div>
  );
}
