class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :student_id, null: false
      t.string :name, null: false
      t.string :email
      t.string :password_digest, null: false
      t.boolean :has_voted, null: false, default: false

      t.timestamps
    end
    add_index :users, :student_id, unique: true
  end
end
