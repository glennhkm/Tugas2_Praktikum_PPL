import readline from "readline";
import fs from "fs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const allJerseys = JSON.parse(
  fs.readFileSync("./database/jersey_master.json", "utf8")
);

const menu = () => {
  console.log("\nMenu:");
  console.log("1. Tampilkan Daftar Jersey");
  console.log("2. Order Jersey");
  console.log("3. Tampilkan Daftar Order");
  console.log("4. Edit Daftar Order");
  console.log("5. Hapus Order");
  console.log("6. Keluar");

  rl.question("\nPilih Menu: ", (answer) => {
    switch (answer) {
      case "1":
        showJerseys();
        break;
      case "2":
        orderJersey();
        break;
      case "3":
        showOrders();
        break;
      case "4":
        editOrder();
        break;
      case "5":
        deleteOrder();
        break;
      case "6":
        rl.close();
        break;
      default:
        console.log("Menu tidak tersedia");
        break;
    }
  });
};

const showJerseys = () => {
  console.log("\nErspo Daftar Jersey");
  console.table(allJerseys.map(jersey => ({
    id: jersey.id,
    Nama: jersey.Nama,
    Harga: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(jersey.Harga),
    Stok: jersey.Stok,
    "Kit Type": jersey["Kit Type"],
    Grade: jersey.Grade
  })));
  menu();
};

const orderJersey = () => {
  console.log("\nOrder Jersey");
  console.log("=".repeat(12));
  console.log("\nSilahkan pilih Kit Type");
  console.log("1. Home");
  console.log("2. Away");

  rl.question("\nPilih Kit Type: ", (kitAnswer) => {
    let kitType;
    switch (kitAnswer) {
      case "1":
        kitType = "Home";
        break;
      case "2":
        kitType = "Away";
        break;
      default:
        console.log("\nMenu tidak tersedia");
        rl.close();
        return;
    }

    console.log("\nSilahkan pilih Grade");
    console.log("1. Player Issue");
    console.log("2. Replica");
    console.log("3. Fans");

    rl.question("\nPilih Grade: ", (gradeAnswer) => {
      let grade;
      switch (gradeAnswer) {
        case "1":
          grade = "Player Issue";
          break;
        case "2":
          grade = "Replica";
          break;
        case "3":
          grade = "Fans";
          break;
        default:
          console.log("\nMenu tidak tersedia");
          rl.close();
          return;
      }

      let jerseys = allJerseys.filter(
        (jersey) => jersey["Kit Type"] === kitType && jersey.Grade === grade
      );

      console.log("\nErspo Daftar Jersey");
      console.table(jerseys.map(jersey => ({
        id: jersey.id,
        Nama: jersey.Nama,
        Harga: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(jersey.Harga),
        Stok: jersey.Stok,
        "Kit Type": jersey["Kit Type"],
        Grade: jersey.Grade
      })));
      

      if (jerseys.length === 0) {
        console.log("Tidak ada jersey tersedia untuk pilihan tersebut.");
        rl.close();
        return;
      }

      rl.question("\nPilih Id Jersey: ", (answer) => {
        const selectedJersey = jerseys.find((jersey) => jersey.id === +answer);
        if (!selectedJersey) {
          console.log("\nJersey tidak ditemukan");
          orderJersey();
          return;
        }

        rl.question("Jumlah: ", (qty) => {
          if (selectedJersey.Stok < +qty) {
            console.log("\nStok tidak cukup");
            orderJersey();
            return;
          }

          const newOrder = {
            id: new Date().getTime(),
            jersey_id: selectedJersey.id,
            Kuantitas: +qty,
            "Total Harga": selectedJersey.Harga * +qty,
          };

          const orders = JSON.parse(
            fs.readFileSync("./database/pemesanan.json", "utf8")
          );
          orders.push(newOrder);

          fs.writeFileSync(
            "./database/pemesanan.json",
            JSON.stringify(orders, null, 2)
          );

          fs.writeFileSync(
            "./database/jersey_master.json",
            JSON.stringify(
              allJerseys.map((jersey) => {
                if (jersey.id === selectedJersey.id) {
                  jersey.Stok -= +qty;
                }
                return jersey;
              }),
              null,
              2
            )
          );

          console.log("\nOrder berhasil!");
          menu();
        });
      });
    });
  });
};

console.log("\nSelamat Datang di Erspo Jersey Store");
console.log("=".repeat(35));
menu();
