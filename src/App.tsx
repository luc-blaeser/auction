import './App.css';
import motokoLogo from './assets/motoko_moving.png';
import motokoShadowLogo from './assets/motoko_shadow.png';
import AuctionForm from './AuctionForm';
import AuctionList from './AuctionList';
import Navigation from './Navigation';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuctionDetail from './AuctionDetail';

function App() {
  return (
    <BrowserRouter>
      <div>
        <a
          href="https://internetcomputer.org/docs/current/developer-docs/build/cdks/motoko-dfinity/motoko/"
          target="_blank"
        >
          <span className="logo-stack">
            <img
              src={motokoShadowLogo}
              className="logo motoko-shadow"
              alt="Motoko logo"
            />
            <img src={motokoLogo} className="logo motoko" alt="Motoko logo" />
          </span>
        </a>
      </div>
      <h1>Motoko Auction Platform</h1>
      <Navigation/>
      <div>
        <Routes>
          <Route path="/" element={<AuctionList />} />
          <Route path="/newAuction" element={<AuctionForm />} />
          <Route path="/viewAuction/:id" element={<AuctionDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
