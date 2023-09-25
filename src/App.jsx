import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, PrivateRoute, SomeLinks, EditListing } from './components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Explore,
  ForgotPassword,
  Offers,
  Profile,
  SignIn,
  SignUp,
  Category,
  CreateListing,
  Listing,
  Contact,
} from './pages';

function App() {
  return (
    <>
      <Router>
        <SomeLinks />
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/category/:categoryName" element={<Category />} />
          <Route path="/profile" element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route
            path="/category/:categoryName/:listingId"
            element={<Listing />}
          />
          <Route path="/contact/:landlordId" element={<Contact />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
        </Routes>
        <Navbar />
      </Router>

      <ToastContainer autoClose={3000} />
    </>
  );
}

export default App;
