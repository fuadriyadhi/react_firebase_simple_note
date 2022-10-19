import React, { useState, useEffect } from "react";
import { firestore } from "./../config/firebaseConfig";
import { doc, setDoc, collection, getDocs, onSnapshot, deleteDoc } from "firebase/firestore";
import moment from "moment/moment";

export default function Home() {
  //state
  const [data, setData] = useState([]);
  const [updateData, setUpdateData] = useState();

  //handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();

    //tangkap value
    let note = e.target.note.value;
    let author = e.target.author.value;

    //valid
    if (!note || !author) {
      return alert("Lengkapi Data!!!");
    }

    //clear field
    e.target.note.value = "";
    e.target.author.value = "";

    //store to firebase
    const docId = Date.now().toString();
    const noteRef = doc(firestore, "note_app", docId);
    setDoc(noteRef, {
      id: docId,
      note: note,
      author: author,
      createdAt: Date.now(),
    })
      .then((res) => console.info("Data Berhasil Disimpan"))
      .catch((err) => console.error(err));
  };

  //func untuk ambil data dari collection
  const getNotesCollection = async () => {
    let collArr = [];
    let noteRef = collection(firestore, "note_app");
    let collectionData = await getDocs(noteRef).then((res) => {
      res.forEach((e) => {
        collArr.push(e.data());
      });
    });
    return collArr;
  };

  //handleUpdate
  const handleUpdate = (e) => {
    e.preventDefault();

    let note = e.target.note.value;

    const noteRef = doc(firestore, "note_app", updateData.id);
    setDoc(noteRef, {
      ...updateData,
      note: note,
    })
      .then((res) => {
        console.info("data updated");
      })
      .catch((err) => {
        console.error(err);
      });
    setUpdateData(null);
  };

  //delete note
  const handleDelete = (id) => {
    let confDelete = confirm("Yakin Mau Didelete?");
    if (!confDelete) {
      return;
    }
    let docId = doc(firestore, "note_app", id);
    deleteDoc(docId)
      .then((res) => {
        alert("data berhasil dihapus!");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  //listener func
  const listener = () => {
    let noteRef = collection(firestore, "note_app");
    onSnapshot(noteRef, (newRec) => {
      getNotesCollection()
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  };

  //comp life cycle
  useEffect(() => {
    getNotesCollection()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error(err);
      });

    //comp did update
    return () => {
      listener();
    };
  }, []);

  return (
    <div className="App">
      <h1>Simple Note</h1>

      <form autoComplete="off" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="note">note</label>
          <textarea id="note"></textarea>
        </div>

        <div>
          <label htmlFor="author">author</label>
          <input type="text" id="author" />
        </div>

        <button type="submit">Submit</button>
      </form>

      <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: 15 }}>
        {data.map((e) => (
          <div
            key={e.id}
            style={{
              position: "relative",
              padding: 20,
              border: "1px solid black",
              borderRadius: 20,
            }}
          >
            {updateData?.id == e.id ? (
              <form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
                onSubmit={handleUpdate}
              >
                <label htmlFor="note">note</label>
                <input type="text" id="note" defaultValue={e.note} />
                <button type="submit">submit</button>
              </form>
            ) : (
              <p>{e.note}</p>
            )}
            <small>{e.author} | </small>
            <small>{moment(e.createdAt).format("DD/MM/YYYY hh:mm")}</small>
            <button
              style={{
                backgroundColor: "red",
                borderRadius: 5,
                position: "absolute",
                top: 4,
                right: 4,
                fontSize: 10,
              }}
              onClick={() => {
                handleDelete(e.id);
              }}
            >
              x
            </button>
            <button
              style={{
                backgroundColor: "green",
                borderRadius: 5,
                position: "absolute",
                top: 4,
                right: 40,
                fontSize: 10,
              }}
              onClick={() => {
                if (!updateData) {
                  return setUpdateData(e);
                }
                setUpdateData(null);
              }}
            >
              ?
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
