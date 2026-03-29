class CreateRegistrationKeys < ActiveRecord::Migration[8.0]
  def change
    create_table :registration_keys do |t|
      t.string :token, null: false
      t.boolean :used, null: false, default: false
      t.references :election, null: false, foreign_key: true
      t.integer :candidate_id  # set once key is claimed

      t.timestamps
    end
    add_index :registration_keys, :token, unique: true
  end
end
