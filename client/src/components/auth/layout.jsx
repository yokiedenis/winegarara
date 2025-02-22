import { Tabs } from "antd";
import AuthLogin  from "../../pages/auth/login"; // Import your Login component
import   Signup  from "../../pages/auth/register"; // Import your Signup component
import "../../entry.scss"; // Import your SCSS file for styling
import img from "@/assets/test4.png";
import img3 from "@/assets/background.png";
// import img2 from "@/assets/transperant.png";
import img4 from "@/assets/logo.png";
function AuthLayout() {
  return (
    <div className="flex bg-black min-h-screen w-full">
      {/* Left Side (Welcome Section) */}
      <div className="obsolute left-0  bg-black w-1/2">
        <div className="max-w-md h-80vh  space-y-6 ">
        <img src={img} className="h-80vh w-full object-cover object-center" />

      </div>
        
      </div>

      {/* Right Side (Form Section) */}
      <div className="flex flex-1 items-center justify-center w-full">
        
        {/* Entry Component with Tabs for Login and Signup */}
        <div className="form-container">
        
          <div className="tabs-container">
        
          <img src={img4} className="h-full w-full" />

          <img src={img3} className="h-full w-full absolute " />
            <Tabs
              items={[
                {
                  key: "login",
                  label: "Login",
                  children: <AuthLogin />,
                },
                {
                  key: "signup",
                  label: "Signup",
                  children: <Signup />,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
