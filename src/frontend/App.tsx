import './App.scss';
import motoko from './assets/motoko.png';
import AuctionForm from './AuctionForm';
import AuctionList from './AuctionList';
import Navigation from './Navigation';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuctionDetail from './AuctionDetail';

function App() {
  return (
    <BrowserRouter>
      <div>
        <img src={motoko} className="logo" alt="Motoko logo" />
      </div>
      <h1>Motoko Auction Platform</h1>
      <Navigation />
      <div className="content">
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
