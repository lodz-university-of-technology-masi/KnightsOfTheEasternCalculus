package model;

public class Experience {
    private String name;
    private String position;
    private String years;

    public Experience(String name, String position, String years) {
        this.name = name;
        this.position = position;
        this.years = years;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getYears() {
        return years;
    }

    public void setYears(String years) {
        this.years = years;
    }
}