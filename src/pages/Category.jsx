import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ListingItem } from '../components';
import {
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase.config.js';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

const Category = () => {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);

  const params = useParams();

  useEffect(() => {
    /* fetch listings */
    const fetchListings = async () => {
      try {
        //get reference
        const listingRef = collection(db, 'listing');
        //create query
        const q = query(
          listingRef,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          limit(5)
        );

        //execute query
        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastVisible);

        const listings = [];
        querySnap.forEach((doc) => {
          listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error('Could not fetch data...');
      }
    };

    fetchListings();
  }, [params.categoryName]);

  /* pagination & load more */
  const onMoreFetchListings = async () => {
    try {
      //get reference
      const listingRef = collection(db, 'listing');
      //create query
      const q = query(
        listingRef,
        where('type', '==', params.categoryName),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchedListing),
        limit(10)
      );

      //execute query
      const querySnap = await getDocs(q);
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchedListing(lastVisible);

      const listings = [];
      querySnap.forEach((doc) => {
        listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings((prevState) => [...prevState, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error('Could not fetch data...');
    }
  };

  ///////////////////////////////////////////////////////////////
  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          {params.categoryName === 'rent'
            ? 'Places for Rent'
            : 'Places for Sale'}
        </p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => {
                return (
                  <ListingItem
                    key={listing.id}
                    listing={listing.data}
                    id={listing.id}
                  />
                );
              })}
            </ul>
          </main>
          <br />
          <br />
          {lastFetchedListing && (
            <p className="loadMore" onClick={onMoreFetchListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>No listings for "{params.categoryName}"</p>
      )}
    </div>
  );
};

export default Category;
