class CreateElections < ActiveRecord::Migration[8.0]
  def change
    create_table :elections do |t|
      t.string :title, null: false
      t.text :description
      t.integer :status, null: false, default: 0  # 0=draft 1=open 2=closed
      t.datetime :starts_at
      t.datetime :ends_at

      t.timestamps
    end
  end
end
