import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db } from "../firebase.config";

import { v4 as uuidv4 } from "uuid";

import { useEffect, useState } from "react";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";

export default function EditListing() {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [geoLocationEnabled] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  // const { loggedIn, checkingStatus } = useAuthStatus();
  const { checkingStatus } = useAuthStatus();
  const [listing, setListing] = useState(null);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    offer: true,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      navigate("/offers");
      toast.error("You cannot Edit that listing");
    }
  }, [listing]);
  useEffect(() => {
    setLoading(true);
    async function fetchListing() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data(), address: docSnap.data().location });
        setLoading(false);
      } else {
        navigate("/");
        toast.error("Listing Doesnt Exist");
      }
    }
    fetchListing();
  }, [params.listingId]);
  // !loggedIn && navigate("/sign-in");

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;
  function onMutate(e) {
    let bool = null;
    if (e.target.value === "true") {
      bool = true;
    }
    if (e.target.value === "false") {
      bool = false;
    }

    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: bool ?? e.target.value,
      }));
    }
  }
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (discountedPrice > regularPrice) {
      toast.error("Discounted price is more than regular price");
      setLoading(false);
      return;
    }
    if (images.length > 6) {
      setLoading(false);
      toast.error("You can upload Maximum 6 images");
      return;
    }
    let geolocation = {};
    if (geoLocationEnabled) {
      console.log("yo");

      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${address}format=json&apiKey=af63b47d70354b55baf0e3da3f48226b`
      );
      const data = await res.json();
      console.log(data);
      if (data.features.length === 0) {
        toast.error("Please enter a correct address");
        setLoading(false);
        return;
      }
      geolocation.lat = data.features[0]?.properties.lat;
      geolocation.lng = data.features[0]?.properties.lon;
    } else {
      geolocation.lng = longitude;
      geolocation.lat = latitude;
    }

    // ! STORE IMAGE IN FIREBASE
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, "images/" + fileName);

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
              default:
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    });

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };
    delete formDataCopy.images;
    delete formDataCopy.address;
    delete formDataCopy.latitude;
    delete formDataCopy.longitude;
    formDataCopy.location = address;
    formDataCopy.userRef = auth.currentUser.uid;
    !offer && delete formDataCopy.discountedPrice;
    const docRef = doc(db, "listings", params.listingId);
    // const docRef = await addDoc(col, formDataCopy);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success("Listing successfully added");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  }
  if (checkingStatus || loading) return <Spinner />;
  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit a Listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label htmlFor="type" className="formLabel">
            Sell / Rent
          </label>
          <div className="formButtons">
            <button
              type="button"
              className={type === "sale" ? "formButtonActive" : "formButton"}
              id="type"
              value="sale"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              className={type === "rent" ? "formButtonActive" : "formButton"}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>
          <label htmlFor="name" className="formLabel">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={onMutate}
            className="formInputName"
            maxLength="32"
            minLength="10"
            required
          />

          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="10"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                className="formInputSmall"
                type="number"
                name="bathrooms"
                id="bathrooms"
                value={bathrooms}
                min="1"
                max="10"
                onChange={onMutate}
                required
              />
            </div>
          </div>
          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            <button
              className={parking ? "formButtonActive" : "formButton"}
              type="button"
              id="parking"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="parking"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              type="button"
              className={furnished ? "formButtonActive" : "formButton"}
              value={true}
              id="furnished"
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={!furnished ? "formButtonActive" : "formButton"}
              id="furnished"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label htmlFor="address" className="formLabel">
            Address
          </label>
          <textarea
            name="address"
            id="address"
            className="formInputAddress"
            value={address}
            onChange={onMutate}
            required
          />
          {!geoLocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  name="longitude"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}
          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              type="button"
              className={offer ? "formButtonActive" : "formButton"}
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={!offer ? "formButtonActive" : "formButton"}
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label htmlFor="regularPrice" className="formLabel">
            Regular Price
          </label>
          <div className="formPriceDiv">
            <input
              type="number"
              name="regularPrice"
              id="regularPrice"
              className="formInputSmall"
              min="50"
              max="750000000"
              onChange={onMutate}
              value={regularPrice}
              required
            />
            {type === "rent" && <p className="formPriceText">$ / Month</p>}
          </div>
          {offer && (
            <>
              <label htmlFor="regularPrice" className="formLabel">
                Discounted Price
              </label>
              <div className="formPriceDiv">
                <input
                  type="number"
                  name="discountedPrice"
                  id="discountedPrice"
                  className="formInputSmall"
                  min="50"
                  max="750000000"
                  value={discountedPrice}
                  onChange={onMutate}
                  required={offer}
                />
                {type === "rent" && <p className="formPriceText">$ / Month</p>}
              </div>
            </>
          )}
          <label htmlFor="regularPrice" className="formLabel">
            Images
          </label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            className="formInputFile"
            type="file"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />
          <button type="submit" className="primaryButton createListingButton">
            Update Listing
          </button>
        </form>
      </main>
    </div>
  );
}
