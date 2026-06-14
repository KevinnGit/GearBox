import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Image } from "react-native"
import { useRouter } from "expo-router"

//images
const evo5 = require("../assets/images/evo5.png")
const firebalde = require("../assets/images/fireblade.png")

//function for select a category either car or motor
const app = () => {
  const router = useRouter()

  const handleCategoryPress = (category: string) => {
    console.log(`${category} selected`);
    router.push({
      pathname: "/details",
      params: { category }
    })
  };

  return(
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>GearBox</Text>
      </View>
      
      <View style={styles.categoriesContainer}>
        <TouchableOpacity style={styles.categoryCard}
          onPress={() => handleCategoryPress('Car')} //press car will select
        >
          <Image source={evo5} style={styles.categoryImage}/>
          <Text style={styles.categoryLabel}>Car</Text>
        </TouchableOpacity>

         <TouchableOpacity style={styles.categoryCard}
          onPress={() => handleCategoryPress('Motorcycle')}//press motor will select
        >
          <Image source={firebalde} style={styles.categoryImage}/>
          <Text style={styles.categoryLabel}>Motorcycle</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3a3f47',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: '300',
    color: '#e8e8e8',
    letterSpacing: 1,
    padding: 40,
  },
  categoriesContainer: {
    alignItems: 'center',
    gap: 40,
    paddingBottom: 60,
  },
  categoryCard: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 250,
  },
  categoryImage: {
    width: 180,
    height: 140,
    borderRadius: 16,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 20,
    fontWeight: '500',
    color: '#b8b8b8',
    letterSpacing: 0.5,
    padding: 10,
  }
});

export default app