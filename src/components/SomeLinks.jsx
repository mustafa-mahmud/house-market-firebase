import { Link } from 'react-router-dom';
import styled from 'styled-components';

const links = {};

const SomeLinks = () => {
  return (
    <Div>
      <Link to="/sign-in">Sign In</Link>
      <Link to="/sign-up">Sign Up</Link>
      <Link to="/forgot-password">Forgot Password</Link>
      <Link to="/create-listing">Create Listing</Link>
    </Div>
  );
};

const Div = styled.div`
  background-color: olive;
  text-align: center;

  a {
    display: inline-block;
    margin: 1rem;
    color: #fff;
  }
`;

export default SomeLinks;
