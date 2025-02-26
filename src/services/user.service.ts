import bcrypt from "bcrypt";
import { isValidObjectId } from "mongoose";
import { UserInterface } from "../interfaces";
import { UserModel } from "../models/user.model";

export class UserService {
  async createUser(name: string, email: string, password: string) {
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new Error("Cet email est déjà pris !");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return await UserModel.create({ name, email, password: hashedPassword });
  }

  async findUserByEmail(email: string) {
    return await UserModel.findOne({ email });
  }

  async getUsers() {
    return await UserModel.find().select("-password -__v");
  }

  async getUserById(id: string) {
    return await UserModel.findById(id);
  }

  async updateUserMe(id: string, updateData: UserInterface) {
    // Vérifier si l'utilisateur existe
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error("Utilisateur introuvable ❌");
    }

    // // Appliquer les mises à jour
    // Object.assign(user, updateData);
    // await user.save();

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("Utilisateur non trouvé ❌");
    }

    return updatedUser;
  }

  async updateUserByAdmin(id: string, updateData: UserInterface) {
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      throw new Error("Utilisateur introuvable ❌");
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateUserFull(id: string, userData: UserInterface) {
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      throw new Error("Utilisateur introuvable ❌");
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      userData,
      {overwrite:true, new: true, runValidators: true}
    )
    
    return updatedUser;
  }

  async deleteUser(id: string) {
    if (!isValidObjectId(id)) {
      throw new Error("ID utilisateur invalide");
    }

    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new Error("Utilisateur non trouvé");
    }
  }

  async createSuperAdminIfNotExists() {
    const existingSuperAdmin = await UserModel.findOne({ role: "superadmin" });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash("didipurple", 10); // 🛑 Change ce mot de passe après installation
      await UserModel.create({
        name: "dylane",
        email: "dylane@didicode.com",
        password: hashedPassword,
        role: "superadmin",
      });

      console.log("✅ Super Admin créé avec succès !");
    }
  }

  async updateUserRole(id: string, role: string) {
    const user = await UserModel.findById(id);
    if (!user) throw new Error("Utilisateur introuvable ❌");

    if (user.role === "superadmin")
      throw new Error("Impossible de modifier le Super Admin ❌");

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      { role },
      { new: true }
    );
    if (!updatedUser) throw new Error("Utilisateur non trouvé");

    return updatedUser;
  }
}
