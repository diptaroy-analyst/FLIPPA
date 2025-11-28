<<<<<<< HEAD
import Layout from "./Layout.jsx";

import FileRenamer from "./FileRenamer";

import Pricing from "./Pricing";

import Account from "./Account";

import Landing from "./Landing";

import SelectUserType from "./SelectUserType";

import Store from "./Store";

import MyPurchases from "./MyPurchases";

import CreatorDashboard from "./CreatorDashboard";

import PlayerProfile from "./PlayerProfile";

import PaymentSuccess from "./PaymentSuccess";

import AuthCallback from "./AuthCallback";

import AdminRosterUpload from "./AdminRosterUpload";

import Marketplace from "./Marketplace";

import Login from './Login';

import Signup from './Signup';

import ForgotPassword  from "./ForgotPassword";

import PaymentFailed from "./PaymentFailed";

import ResetPassword from "./ResetPassword";

import SubscriptionCancelled from "./SubscriptionCancelled";


import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    FileRenamer: FileRenamer,
    Pricing: Pricing,
    Account: Account,
    Landing: Landing,
    SelectUserType: SelectUserType,
    Store: Store,
    MyPurchases: MyPurchases,
    CreatorDashboard: CreatorDashboard,
    PlayerProfile: PlayerProfile,
    PaymentSuccess: PaymentSuccess,
    AuthCallback: AuthCallback,
    AdminRosterUpload: AdminRosterUpload,
    Marketplace: Marketplace,
    Login: Login,
    Signup: Signup,
    ForgotPassword: ForgotPassword,
    PaymentFailed: PaymentFailed,
    ResetPassword: ResetPassword,
    SubscriptionCancelled: SubscriptionCancelled,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }
    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />
                <Route path="/subscription-cancelled" element={<SubscriptionCancelled />} />
                <Route path="/" element={<FileRenamer />} />
                <Route path="/FileRenamer" element={<FileRenamer />} />
                <Route path="/Pricing" element={<Pricing />} />
                <Route path="/Account" element={<Account />} />
                <Route path="/Landing" element={<Landing />} />
                <Route path="/SelectUserType" element={<SelectUserType />} />
                <Route path="/Store" element={<Store />} />
                <Route path="/MyPurchases" element={<MyPurchases />} />
                <Route path="/CreatorDashboard" element={<CreatorDashboard />} />
                <Route path="/PlayerProfile" element={<PlayerProfile />} />
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                <Route path="/AuthCallback" element={<AuthCallback />} />
                <Route path="/AdminRosterUpload" element={<AdminRosterUpload />} />
                <Route path="/Marketplace" element={<Marketplace />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
=======
import Layout from "./Layout.jsx";

import FileRenamer from "./FileRenamer";

import Pricing from "./Pricing";

import Account from "./Account";

import Landing from "./Landing";

import SelectUserType from "./SelectUserType";

import Store from "./Store";

import MyPurchases from "./MyPurchases";

import CreatorDashboard from "./CreatorDashboard";

import PlayerProfile from "./PlayerProfile";

import PaymentSuccess from "./PaymentSuccess";

import AuthCallback from "./AuthCallback";

import AdminRosterUpload from "./AdminRosterUpload";

import Marketplace from "./Marketplace";

import Login from './Login';

import Signup from './Signup';

import ForgotPassword  from "./ForgotPassword";

import PaymentFailed from "./PaymentFailed";

import ResetPassword from "./ResetPassword";

import SubscriptionCancelled from "./SubscriptionCancelled";


import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    FileRenamer: FileRenamer,
    Pricing: Pricing,
    Account: Account,
    Landing: Landing,
    SelectUserType: SelectUserType,
    Store: Store,
    MyPurchases: MyPurchases,
    CreatorDashboard: CreatorDashboard,
    PlayerProfile: PlayerProfile,
    PaymentSuccess: PaymentSuccess,
    AuthCallback: AuthCallback,
    AdminRosterUpload: AdminRosterUpload,
    Marketplace: Marketplace,
    Login: Login,
    Signup: Signup,
    ForgotPassword: ForgotPassword,
    PaymentFailed: PaymentFailed,
    ResetPassword: ResetPassword,
    SubscriptionCancelled: SubscriptionCancelled,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }
    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />
                <Route path="/subscription-cancelled" element={<SubscriptionCancelled />} />
                <Route path="/" element={<FileRenamer />} />
                <Route path="/FileRenamer" element={<FileRenamer />} />
                <Route path="/Pricing" element={<Pricing />} />
                <Route path="/Account" element={<Account />} />
                <Route path="/Landing" element={<Landing />} />
                <Route path="/SelectUserType" element={<SelectUserType />} />
                <Route path="/Store" element={<Store />} />
                <Route path="/MyPurchases" element={<MyPurchases />} />
                <Route path="/CreatorDashboard" element={<CreatorDashboard />} />
                <Route path="/PlayerProfile" element={<PlayerProfile />} />
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                <Route path="/AuthCallback" element={<AuthCallback />} />
                <Route path="/AdminRosterUpload" element={<AdminRosterUpload />} />
                <Route path="/Marketplace" element={<Marketplace />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
>>>>>>> cd738166eff61c4e0c545c469221835d2734fe9e
}