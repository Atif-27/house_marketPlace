import { useEffect, useState } from "react";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Spinner from "../components/Spinner";
import { Zoom, toast } from "react-toastify";

export default function CreateListing() {
  const [submitLoading,setSubmitLoading]=useState(false)
  const [geoLocationEnabled] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  const { loggedIn, checkingStatus } = useAuthStatus();
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
    imgUrls: {},
    latitude: 0,
    longitude: 0,
  });
  !loggedIn && navigate("/sign-in");

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
    imgUrls,
    latitude,
    longitude,
  } = formData;
  function onMutate(e) {
    let bool=null;
    if (e.target.value === "true") {
      bool = true
    }
    if (e.target.value === "false") {
      bool = false
    }

    if(e.target.files){
      setFormData((prevState)=>({
        ...prevState,
        imgUrls:e.target.files
      }))
    }
    if(!e.target.files)
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: bool ?? e.target.value,
    }))
  }
  async function onSubmit(e){
    e.preventDefault();
    setSubmitLoading(true)
    if(discountedPrice>regularPrice)
    {
      toast.error('Discounted price is more than regular price');
      setSubmitLoading(false);
      return;
    }
    if(imgUrls.length >6)
    {
      setSubmitLoading(false);
      toast.error('You can upload Maximum 6 images');
      return;
    }
    let geolocation={}
    let location;
    if(geoLocationEnabled){
      console.log('yo');
      
      const res = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${address}format=json&apiKey=af63b47d70354b55baf0e3da3f48226b`);
      const data=await res.json()
      console.log(data);
      if(data.features.length===0)
      {
        toast.error('Please enter a correct address');
        setSubmitLoading(false)
        return;;
      }
      geolocation.lat=data.features[0]?.properties.lat;
      geolocation.lng=data.features[0]?.properties.lon;
      console.log(geolocation)
    }
    else
    {
      geolocation.lng=longitude
      geolocation.lat=latitude
      console.log(geolocation)

      location=address;
    }
    setSubmitLoading(false)
  }
  if (checkingStatus || submitLoading) return <Spinner />;

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Create a Listing</p>
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
              value='sale'
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              className={type === "rent" ? "formButtonActive" : "formButton"}
              id="type"
              value='rent'
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
         <label className='formLabel'>Parking spot</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value={true}
              onClick={onMutate}
              min='1'
              max='50'
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='parking'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label  className="formLabel">
            Furnished
          </label>
          <div className="formButtons">
            <button
              type="button"
              className={furnished? "formButtonActive" : "formButton"}
              value={true}
              id="furnished"
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={
                !furnished  ? "formButtonActive" : "formButton"
              }
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
              className={!offer? "formButtonActive" : "formButton"}
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
            {type==='rent' && <p className='formPriceText'>$ / Month</p>}
          </div>
          {offer && <>
            <label htmlFor="regularPrice" className="formLabel">
            Discounted Price
          </label><div className="formPriceDiv">
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
            {type==='rent' && <p className='formPriceText'>$ / Month</p>}
          </div></>}
          <label htmlFor="regularPrice" className="formLabel">
            Images
          </label>
          <p className="imagesInfo">The first image will be the cover (max 6).</p>
          <input type="file" className="formInputFile" max='6'  accept=".jpg,.png,.jpeg" multiple required  />
          <button type="submit" className="primaryButton createListingButton">Create Listing</button>
        </form>

      </main>
    </div>
  );
}
