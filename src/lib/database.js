import { supabase } from "./supabase";


/* =========================================================
   PROFILE
========================================================= */

export async function getMyProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const { data, error } =
    await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function getProfiles() {
  const { data, error } =
    await supabase
      .from("profiles")
      .select("*")
      .order("joined", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return data || [];
}


export async function updateProfile(
  id,
  updates
) {
  const { data, error } =
    await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   CARDS
========================================================= */

export async function getCards() {
  const { data, error } =
    await supabase
      .from("cards")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return data || [];
}


export async function createCard(card) {
  const { data, error } =
    await supabase
      .from("cards")
      .insert(card)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function updateCard(
  id,
  updates
) {
  const { data, error } =
    await supabase
      .from("cards")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function deleteCard(
  id,
  imagePath = null
) {
  const { error } =
    await supabase
      .from("cards")
      .delete()
      .eq("id", id);

  if (error) {
    throw error;
  }

  if (imagePath) {
    const { error: storageError } =
      await supabase.storage
        .from("card-images")
        .remove([imagePath]);

    if (storageError) {
      console.warn(
        "Card deleted, but image cleanup failed:",
        storageError
      );
    }
  }
}


export async function uploadCardImage(
  file
) {
  if (!file) {
    return null;
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "jpg";

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const filePath =
    `cards/${fileName}`;

  const {
    error: uploadError,
  } =
    await supabase.storage
      .from("card-images")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          upsert: false,
        }
      );

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: publicData,
  } =
    supabase.storage
      .from("card-images")
      .getPublicUrl(filePath);

  return {
    url: publicData.publicUrl,
    path: filePath,
  };
}


export async function deleteCardImage(
  path
) {
  if (!path) {
    return;
  }

  const { error } =
    await supabase.storage
      .from("card-images")
      .remove([path]);

  if (error) {
    throw error;
  }
}


/* =========================================================
   EVENTS
========================================================= */

export async function getEvents() {
  const { data, error } =
    await supabase
      .from("events")
      .select("*")
      .order("event_date", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return data || [];
}


export async function createEvent(
  event
) {
  const { data, error } =
    await supabase
      .from("events")
      .insert(event)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function updateEvent(
  id,
  updates
) {
  const { data, error } =
    await supabase
      .from("events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function deleteEvent(
  id,
  imagePath = null
) {
  const { error } =
    await supabase
      .from("events")
      .delete()
      .eq("id", id);

  if (error) {
    throw error;
  }

  if (imagePath) {
    const { error: storageError } =
      await supabase.storage
        .from("event-images")
        .remove([imagePath]);

    if (storageError) {
      console.warn(
        "Event deleted, but image cleanup failed:",
        storageError
      );
    }
  }
}


export async function uploadEventImage(
  file
) {
  if (!file) {
    return null;
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "jpg";

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const filePath =
    `events/${fileName}`;

  const {
    error: uploadError,
  } =
    await supabase.storage
      .from("event-images")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          upsert: false,
        }
      );

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: publicData,
  } =
    supabase.storage
      .from("event-images")
      .getPublicUrl(filePath);

  return {
    url: publicData.publicUrl,
    path: filePath,
  };
}


export async function deleteEventImage(
  path
) {
  if (!path) {
    return;
  }

  const { error } =
    await supabase.storage
      .from("event-images")
      .remove([path]);

  if (error) {
    throw error;
  }
}


export async function registerForEvent(
  eventId
) {
  const { error } =
    await supabase.rpc(
      "register_for_event",
      {
        p_event_id: eventId,
      }
    );

  if (error) {
    throw error;
  }
}


/* =========================================================
   RANKINGS
========================================================= */

export async function getRankings() {
  const { data, error } =
    await supabase
      .from("rankings")
      .select("*")
      .order("bracket")
      .order("rank");

  if (error) {
    throw error;
  }

  return data || [];
}


export async function createRanking(
  ranking
) {
  const { data, error } =
    await supabase
      .from("rankings")
      .insert(ranking)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function updateRanking(
  id,
  updates
) {
  const { data, error } =
    await supabase
      .from("rankings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function deleteRanking(
  id
) {
  const { error } =
    await supabase
      .from("rankings")
      .delete()
      .eq("id", id);

  if (error) {
    throw error;
  }
}


/* =========================================================
   QUESTIONS
========================================================= */

export async function getQuestions() {
  const { data, error } =
    await supabase
      .from("community_questions")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return data || [];
}


export async function createQuestion({
  question,
  category = "General",
}) {
  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      "Not authenticated."
    );
  }

  const profile =
    await getMyProfile();

  const { data, error } =
    await supabase
      .from("community_questions")
      .insert({
        user_id: user.id,
        user_name:
          profile?.full_name ||
          user.email ||
          "User",
        category,
        question,
        replies: 0,
        status: "Open",
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function updateQuestionStatus(
  id,
  status
) {
  const { data, error } =
    await supabase
      .from("community_questions")
      .update({
        status,
      })
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function deleteQuestion(
  id
) {
  const { error } =
    await supabase
      .from("community_questions")
      .delete()
      .eq("id", id);

  if (error) {
    throw error;
  }
}


/* =========================================================
   ORDERS
========================================================= */

export async function getOrders() {
  const { data, error } =
    await supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return data || [];
}


export async function updateOrder(
  id,
  updates
) {
  const { data, error } =
    await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function deleteOrder(
  id
) {
  const { error } =
    await supabase
      .from("orders")
      .delete()
      .eq("id", id);

  if (error) {
    throw error;
  }
}


export async function checkoutCart(
  cart
) {
  if (!cart?.length) {
    throw new Error(
      "Cart is empty."
    );
  }

  const items =
    cart.map(
      (item) => ({
        card_id: item.id,
        quantity: Number(
          item.quantity
        ),
      })
    );

  const { data, error } =
    await supabase.rpc(
      "checkout_cart",
      {
        p_items: items,
      }
    );

  if (error) {
    throw error;
  }

  return data;
}