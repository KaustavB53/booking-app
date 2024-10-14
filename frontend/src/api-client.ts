import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";
import { HotelType } from '../../backend/src/models/hotel';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const register = async(formData: RegisterFormData)=>{
    console.log("API call initiated with data:", formData);
    const response = await fetch(`${API_BASE_URL}/api/users/register`,{
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
    })

    const responseBody = await response.json();

    if(!response.ok){
        throw new Error (responseBody.message);
    }
};


export const signIn = async (formData: SignInFormData)=>{
    const response = await fetch (`${API_BASE_URL}/api/auth/login`,{
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(formData)
    })
    const body = await response.json();

    if(!response.ok){
        throw new Error (body.message);
    }
    return body;
};

export const validateToken = async()=>{
    const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`,{
        credentials: 'include',
    })

    if(!response.ok){
        throw new Error ('Token Invalid');
    }

    return response.json();
};

export const signOut = async()=>{
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`,{
        credentials: 'include',
        method: 'POST',

    });

    if(!response.ok){
        throw new Error('Error during sign out')
    }
};

export const addMyHotel = async (hotelFormData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
        method: 'POST',
        credentials: "include",
        body: hotelFormData,
    });

    const responseBody = await response.json();

    // Log the entire response for debugging
    console.log("Server Response:", responseBody);

    if (!response.ok) {
        // Log the response status and body for detailed debugging
        console.error('Error Status:', response.status);
        console.error('Error Response Body:', responseBody);
        
        // Improve the error message based on the status
        if (response.status === 400) {
            throw new Error('Invalid data provided. Please check the form fields.');
        } else if (response.status === 500) {
            throw new Error('Server error occurred. Please try again later.');
        } else {
            throw new Error(`Unexpected error: ${responseBody.message}`);
        }
    }

    return responseBody;
};

export const fetchMyHotels = async():Promise<HotelType[]>=>{
    const response = await fetch(`${API_BASE_URL}/api/my-hotels`,{
        credentials:'include',
    });

    if(!response.ok){
        throw new Error('Error fetching hotels');
    }

    return response.json()
};

export const fetchMyHotelById = async(hotelId: string):Promise<HotelType[]>=>{
    const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelId}`,{
        credentials: 'include'
    })
    if(!response.ok){
        throw new Error('Error fetching hotels');
    }

    return response.json()
};

export const updateMyHotelById = async(hotelFormData: FormData)=>{
    const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelFormData.get('hotelId')}`,
{
    method: 'PUT',
    body: hotelFormData,
    credentials: 'include',
})
if(!response.ok){
    throw new Error('Error updating hotel');
}

return response.json();
}

