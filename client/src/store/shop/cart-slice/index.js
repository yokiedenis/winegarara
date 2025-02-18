import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  cartItems: JSON.parse(sessionStorage.getItem("guestCart")) || [],
  isLoading: false,
  isGuestCart: true,
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }, { rejectWithValue, getState }) => {
    const state = getState();
    const isGuest = !state.auth.user;
    // console.log("auth.user:", state.auth.user);
    if (isGuest) {
      try {
        // Verify product exists
        const productRes = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/api/shop/cart/verifyExistence/${productId}`
        );
        const products = productRes.data;

        // Update sessionStorage
        const guestCart = JSON.parse(sessionStorage.getItem("guestCart")) || [];
        const existingIndex = guestCart.findIndex(
          (item) => item.productId === productId
        );

        if (existingIndex >= 0) {
          guestCart[existingIndex].quantity += quantity;
          // Check if products data is nested under 'data'
          guestCart[existingIndex].image = products.data?.image;
          guestCart[existingIndex].title = products.data?.title;
          guestCart[existingIndex].price = products.data?.price;
        } else {
          guestCart.push({
            productId,
            quantity,
            image: products.data?.image,
            title: products.data?.title,
            price: products.data?.price,
          });
        }

        sessionStorage.setItem("guestCart", JSON.stringify(guestCart));

        const newguestcart = { items: [...guestCart] };
        // console.log("newguestcart",newguestcart)
        return { data: newguestcart };
      } catch (error) {
        return rejectWithValue("Product not found");
      }
    } else {
      // Existing API call for logged-in users
      const token = sessionStorage.getItem("token");
      // console.log("token",token)
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/shop/cart/add`,
          {
            userId: state.auth.user.id,
            productId,
            quantity,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return { data: response.data.data }; // Ensure this returns { data: cartItems }
      } catch (error) {
        return rejectWithValue(error.response?.data || "An error occurred");
      }
    }
  }
);
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue, getState }) => {
    const state = getState();
    const isGuest = !state.auth.user;

    if (isGuest) {
      try {
        const guestCart = JSON.parse(
          sessionStorage.getItem("guestCart") || "[]"
        );

        // Filter out invalid products and update sessionStorage
        const newguestcart = { items: [...guestCart] };
        return { data: newguestcart };
      } catch (error) {
        return rejectWithValue("Error fetching cart");
      }
    } else {
      // Existing API call for logged-in users
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/shop/cart/get/${userId}`
        );
        const newresponse = { items: [...response.data.data] };

        return { data: newresponse }; // Ensure this returns { data: cartItems, userId }
      } catch (error) {
        return rejectWithValue(error.response?.data || "An error occurred");
      }
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",

  async ({ productId, userId }, { rejectWithValue, getState }) => {
    const state = getState();
    const isGuest = !state.auth.user;

    if (isGuest) {
      const guestCart = JSON.parse(sessionStorage.getItem("guestCart") || "[]");
      const updatedCart = guestCart.filter(
        (item) => item.productId !== productId
      );
      sessionStorage.setItem("guestCart", JSON.stringify(updatedCart));
      const newAfterDeleteCart = { items: [...updatedCart] };
      return { data: newAfterDeleteCart };
    } else {
      try {
        const response = await axios.delete(
          `${
            import.meta.env.VITE_API_URL
          }/api/shop/cart/delete/${userId}/${productId}`
        );

        const newresponse = { items: [...response.data.data] };

        return { data: newresponse };
      } catch (error) {
        return rejectWithValue(error.response?.data || "failed to delete");
      }
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity }, { rejectWithValue, getState }) => {
    const state = getState();
    const isGuest = !state.auth.user;

    if (isGuest) {
      const guestCart = JSON.parse(sessionStorage.getItem("guestCart") || "[]");
      const itemIndex = guestCart.findIndex(
        (item) => item.productId === productId
      );

      if (itemIndex === -1) return rejectWithValue("Item not found");

      guestCart[itemIndex].quantity = quantity;
      sessionStorage.setItem("guestCart", JSON.stringify(guestCart));
      const newAfterQty = { items: [...guestCart] };
      return { data: newAfterQty };
    } else {
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/shop/cart/update-cart`,
          {
            userId,
            productId,
            quantity,
          }
        );
        // saver
        // console.log("autofetc", response.data);
        const newresponse = { items: [...response.data.data] };

        return { data: newresponse };
      } catch (error) {
        return rejectWithValue(error.response?.data || "failed to delete");
      }
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    setGuestCart: (state, action) => {
      state.cartItems = action.payload;
      state.isGuestCart = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        state.isGuestCart = !action.payload.userId;
        // console.log("fupdateCartQuantity:", action.payload.data);
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;

        state.isGuestCart = !action.payload.userId;
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
 
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      });
  },
});
export const { setGuestCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
