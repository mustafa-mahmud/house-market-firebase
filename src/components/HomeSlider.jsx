import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.config.js';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import Spinner from './Spinner';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

const HomeSlider = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListing] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = collection(db, 'listing');
      const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5));
      const querySnap = await getDocs(q);

      let listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListing(listings);
      setLoading(false);
    };

    fetchListings();
  }, []);

  ////////////////////////////////////////////////////////////
  if (listings?.length === 0) return <></>;

  if (loading) return <Spinner />;

  return (
    listings && (
      <>
        <p className="exploreHeading">Recommended</p>
        <Swiper slidesPerView={1} pagination={{ clickable: true }}>
          {listings.map(({ data, id }) => {
            return (
              <SwiperSlide
                key={id}
                onClick={() => navigate(`/category/${data.type}/${id}`)}
              >
                <div
                  className="swiperSlideDiv"
                  style={{
                    background: `url(${data.imgUrls[0]}) center no-repeat`,
                    backgroundSize: 'cover',
                  }}
                >
                  <p className="swiperSlideText">{data.name}</p>
                  <p className="swiperSlidePrice">
                    ${data.disountedPrice ?? data.regularPrice}{' '}
                    {data.type === 'rent' && '/ month'}
                  </p>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </>
    )
  );
};

export default HomeSlider;
