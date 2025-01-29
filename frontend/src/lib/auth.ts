import axios from "axios";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;


export async function checkUserRole(){
    
    try {
    const response = await axios.get(`${BACKEND_URL}/auth/session`, {
        withCredentials: true,
      });
      console.log(response.data.user_role)
    return response.data.user_role;
    }
    catch (error) {
        console.error(error)
        return null;
    }
}