import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { db } from "../firebase.config";
import { toast } from "react-toastify";

export default function Contact() {
  const [message, setMessage] = useState();
  const [landlord, setLandlord] = useState();
  const params = useParams();
  const [searchParams, setSeachParams] = useSearchParams();
  useEffect(
    function () {
      async function fetchLandlord() {
        const docRef = doc(db, "users", params.landlordId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists) {
          setLandlord(docSnap.data());
        } else {
          toast.error("Could not get landlord data");
        }
      }

      fetchLandlord();
    },
    [params.landlordId]
  );
  function onChange(e) {
    setMessage(e.target.value);
  }
  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Contact Landlord</p>
      </header>
      {landlord !== null && (
        <main>
          <div className="contactLandlord">
            <p className="landlordName">Contact {landlord?.name}</p>
          </div>
          <form className="messageForm">
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">
                Message
              </label>
              <textarea
                name="message"
                id="messsage"
                className="textarea"
                onChange={onChange}
                value={message}
              ></textarea>
            </div>
            <a
              href={`mailto:${landlord?.email}?Subject=${searchParams.get(
                "listingName"
              )}&body=${message}`}
            >
              <button type="button" className="primaryButton">
                Send Message
              </button>
            </a>
          </form>
        </main>
      )}
    </div>
  );
}
