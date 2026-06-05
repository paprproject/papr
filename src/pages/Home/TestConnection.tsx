import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

function TestConnection() {
  useEffect(() => {
    async function test() {
      const { data, error } = await supabase
        .from("products")
        .select("*");

      console.log("DATA:", data);
      console.log("ERROR:", error);

      alert("Supabase connection tested");
    }

    test();
  }, []);

  return null;
}

export default TestConnection;