import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { db } from '../firebase.config.js';
import { v4 as uuidv4 } from 'uuid';

const EditListing = () => {
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState(false);
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: true,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });
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
  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();
  const isMounted = useRef(true);

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (discountedPrice >= regularPrice) {
      setLoading(false);

      return toast.error(
        'Discounted price must be lower than Regular price...'
      );
    }

    if (images.length > 5) {
      setLoading(false);

      return toast.error('Max 5 images allowed...');
    }

    let geolocation = {};
    let location;

    if (geolocationEnabled) {
      toast.error('NO Geoloaction API available for project......');
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;

      location = address;
    }

    //store image in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, 'images/' + fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');

            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
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
      toast.error('Images not uploaded');
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
    formDataCopy.location = address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    /* update listing */
    const docRef = doc(db, 'listing', params.id);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);

    toast.success('Listing saved');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  const onMutate = (e) => {
    let boolean = null;

    if (e.target.value === 'true') {
      boolean = true;
    }
    if (e.target.value === 'false') {
      boolean = false;
    }

    //files
    if (e.target.files) {
      setFormData((prevState) => {
        return {
          ...prevState,
          images: e.target.files,
        };
      });
    }

    //text/boolean/number
    if (!e.target.files) {
      setFormData((prevState) => {
        return {
          ...prevState,
          //??= nullish operator execute if left value Null or Undefiend
          [e.target.id]: boolean ?? e.target.value,
        };
      });
    }

    setLoading(false);
  };

  //redirect if listing is not this user's
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error('You can not edit that listing...');
      navigate('/');
    }
  }, []);

  useEffect(() => {
    setLoading(true);

    const fetchListing = async () => {
      const docRef = doc(db, 'listing', params.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data(), address: docSnap.data().location });
        setLoading(false);
      } else {
        navigate('/');
        toast.error('Listing does not exists...');
      }
    };

    fetchListing();
  }, [params.id, navigate]);

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate('/sign-in');
        }
      });
    }

    return () => {
      isMounted.current = false;
    };

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  //////////////////////////////////////////////////////////
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit a Listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label htmlFor="" className="formLabel">
            Sale/Rent
          </label>
          <div className="formButtons">
            <button
              type="button"
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="sale"
              onClick={onMutate}
            >
              Sale
            </button>
            <button
              type="button"
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          {/* name */}
          <label htmlFor="formLabel">Name</label>
          <input
            type="text"
            value={name}
            onChange={onMutate}
            maxLength="32"
            minLength="10"
            required
            id="name"
            className="formInputName"
          />

          {/* bedrooms */}
          <div className="formRooms flex">
            <div>
              <label htmlFor="" className="formLabel">
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                className="formInputSmall"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            {/* bathrooms */}
            <div>
              <label htmlFor="" className="formLabel">
                Bathrooms
              </label>
              <input
                type="number"
                id="bathrooms"
                className="formInputSmall"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>
          {/* parking button */}
          <label htmlFor="" className="formLabel">
            Parking spot
          </label>
          <div className="formButtons">
            <button
              type="button"
              id="parking"
              className={parking ? 'formButtonActive' : 'formButton'}
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              type="button"
              id="parking"
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          {/* furnished button */}
          <label htmlFor="" className="formLabel">
            Furnished
          </label>
          <div className="formButtons">
            <button
              type="button"
              id="furnished"
              className={furnished ? 'formButtonActive' : 'formButton'}
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              id="furnished"
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          {/* address */}
          <label htmlFor="" className="formLabel">
            Address
          </label>
          <textarea
            id="address"
            type="text"
            className="formInputAddress"
            value={address}
            onChange={onMutate}
            required
          ></textarea>

          {/* latitude/longtitude */}
          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  type="number"
                  value={latitude}
                  onChange={onMutate}
                  required
                  className="formInputSmall"
                  id="latitude"
                />
              </div>
              <div>
                <label htmlFor="" className="formLabel">
                  Longitude
                </label>
                <input
                  type="number"
                  value={longitude}
                  onChange={onMutate}
                  required
                  id="longitude"
                  className="formInputSmall"
                />
              </div>
            </div>
          )}

          {/* offer */}
          <label htmlFor="" className="formLable">
            Offer
          </label>
          <div className="formButtons">
            <button
              type="button"
              id="offer"
              className={offer ? 'formButtonActive' : 'formButton'}
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              id="offer"
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          {/* regular price */}
          <label htmlFor="" className="formLabel">
            Regular Price
          </label>
          <div className="formPriceDiv">
            <input
              type="number"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="750000000"
              required
              className="formInputSmall"
              id="regularPrice"
            />
            {type === 'rent' && <p className="formPriceText">$ / Month</p>}
          </div>

          {/* discounted price */}
          {offer && (
            <>
              <label htmlFor="" className="formLabel">
                Discounted Price
              </label>
              <input
                type="number"
                value={discountedPrice}
                onChange={onMutate}
                min="50"
                max="750000000"
                required={offer}
                id="discountedPrice"
                className="formInputSmall"
              />
            </>
          )}

          {/* images */}
          <label htmlFor="" className="formLabel">
            Images
          </label>
          <p className="imagesInfo">
            The first image will be the cover (max 6mp)
          </p>
          <input
            type="file"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
            id="images"
            className="formInputFile"
          />

          {/* button */}
          <button className="primaryButton createListingButton" type="submit">
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditListing;
