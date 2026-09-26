import {
  useEffect,
  useState,
} from "react";

import AdminApp from "./admin/AdminApp";
import Login from "./login/Login";
import UserApp from "./user/UserApp";

import {
  supabase,
} from "./lib/supabase";

import {
  getMyProfile,
} from "./lib/database";

import "./App.css";


function App() {
  const [
    session,
    setSession,
  ] =
    useState(null);

  const [
    profile,
    setProfile,
  ] =
    useState(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  useEffect(() => {
    let alive = true;

    async function initialize() {
      try {
        const {
          data: {
            session:
              currentSession,
          },
          error,
        } =
          await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!alive) {
          return;
        }

        setSession(
          currentSession
        );
      } catch (error) {
        console.error(
          "Session error:",
          error
        );

        if (alive) {
          setLoading(
            false
          );
        }
      }
    }

    initialize();


    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          newSession
        ) => {
          if (!alive) {
            return;
          }

          setSession(
            newSession
          );
        }
      );


    return () => {
      alive = false;

      subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      if (!session) {
        setProfile(
          null
        );

        setLoading(
          false
        );

        return;
      }

      setLoading(
        true
      );

      try {
        const data =
          await getMyProfile();

        if (alive) {
          setProfile(
            data
          );
        }
      } catch (error) {
        console.error(
          "Profile error:",
          error
        );

        if (alive) {
          setProfile(
            null
          );
        }
      } finally {
        if (alive) {
          setLoading(
            false
          );
        }
      }
    }

    loadProfile();


    return () => {
      alive = false;
    };
  }, [
    session,
  ]);


  async function handleLogout() {
    try {
      /*
       * Remove saved cart
       * when the user logs out.
       */
      localStorage.removeItem(
        "stax_cart"
      );

      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      alert(
        "Could not log out."
      );
    }
  }


  if (loading) {
    return (
      <div
        style={{
          minHeight:
            "100vh",

          display:
            "grid",

          placeItems:
            "center",

          fontFamily:
            "Inter, sans-serif",
        }}
      >
        Loading STAX...
      </div>
    );
  }


  if (!session) {
    return (
      <Login />
    );
  }


  if (!profile) {
    return (
      <div
        style={{
          minHeight:
            "100vh",

          display:
            "grid",

          placeItems:
            "center",
        }}
      >
        Unable to load account.
      </div>
    );
  }


  if (
    profile.status !==
    "Active"
  ) {
    return (
      <div
        style={{
          minHeight:
            "100vh",

          display:
            "grid",

          placeItems:
            "center",
        }}
      >

        <div>

          <h2>
            Account unavailable
          </h2>

          <button
            type="button"
            onClick={
              handleLogout
            }
          >
            Log out
          </button>

        </div>

      </div>
    );
  }


  if (
    String(
      profile.role
    ).toLowerCase() ===
    "admin"
  ) {
    return (
      <AdminApp
        profile={
          profile
        }
        onLogout={
          handleLogout
        }
      />
    );
  }


  return (
    <UserApp
      profile={
        profile
      }
      onLogout={
        handleLogout
      }
    />
  );
}


export default App;