// This component serves as the login page of the application and displays the login form.
import LoginControl from '@/components/Login/control';

export const metadata = {
  title: 'Login - Validata',
  description: 'Login to the Validata Clinical Trial Validation Portal',
};

// This function defines the login page and returns the login control component.
export default function LoginPage() {
  return <LoginControl />;
}
