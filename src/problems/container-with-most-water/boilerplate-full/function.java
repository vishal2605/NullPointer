//USER_CODE_HERE
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int heightSize = sc.nextInt();
        List<Integer> height = new ArrayList<>();
        for (int i = 0; i < heightSize; i++) height.add(sc.nextInt());
        Solution sol = new Solution();
        int result = sol.maxArea(height);
        System.out.println(result);
    }
}