import { Navigate, Route, Routes } from 'react-router-dom'
import { CustomerLayout } from './layouts/CustomerLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { HomePage } from './pages/customer/HomePage'
import { CheckoutPage } from './pages/customer/CheckoutPage'
import { OrderConfirmation } from './pages/customer/OrderConfirmation'
import { TrackOrderPage } from './pages/customer/TrackOrderPage'
import { CustomerLoginPage } from './pages/customer/CustomerLoginPage'
import { AccountPage } from './pages/customer/AccountPage'
import { LoginPage } from './pages/admin/LoginPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { OrdersPage } from './pages/admin/OrdersPage'
import { CounterOrderPage } from './pages/admin/CounterOrderPage'
import { ProductsPage } from './pages/admin/ProductsPage'
import { ProductFormPage } from './pages/admin/ProductFormPage'
import { CategoriesPage } from './pages/admin/CategoriesPage'
import { DealsPage } from './pages/admin/DealsPage'
import { AddonsPage } from './pages/admin/AddonsPage'
import { CustomersPage } from './pages/admin/CustomersPage'
import { CustomerDetailPage } from './pages/admin/CustomerDetailPage'
import { SalesPage } from './pages/admin/SalesPage'
import { SettingsPage } from './pages/admin/SettingsPage'
import { ReceiptPrinter } from './components/admin/OrderReceipt'

export default function App() {
  return (
    <>
    <ReceiptPrinter />
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:id" element={<OrderConfirmation />} />
        <Route path="/track/:id" element={<TrackOrderPage />} />
        <Route path="/login" element={<CustomerLoginPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="counter" element={<CounterOrderPage />} />
        <Route path="orders/:id" element={<OrdersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="addons" element={<AddonsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
